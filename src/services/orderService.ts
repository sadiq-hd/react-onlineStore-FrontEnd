import { AxiosError } from 'axios';
import api, { handleApiError } from '../config/apiConfig';
import { 
    CreateOrderDto, 
    OrderResponseDto, 
    PaymentMethodType,
    OrderStatus,
    PaymentStatus,
    OrderFilter,
    OrderPaginationResponse,
    TopCustomer
} from '../typerScript/order';

class OrderService {
    private readonly basePath = '/Orders';

    async validatePaymentDetails(paymentMethod: PaymentMethodType, paymentDetails?: Record<string, string>): Promise<string | null> {
        if (paymentMethod === PaymentMethodType.CREDIT_CARD || 
            paymentMethod === PaymentMethodType.MADA) {
            if (!paymentDetails?.cardNumber || 
                !paymentDetails?.expiryDate || 
                !paymentDetails?.cvv) {
                return 'جميع بيانات البطاقة مطلوبة';
            }

            // التحقق من رقم البطاقة (قبول فيزا وماستركارد)
            const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
            if (!/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/.test(cardNumber)) {
                return 'رقم البطاقة غير صحيح';
            }

            // التحقق من تاريخ الانتهاء وعدم قبول البطاقات المنتهية
            const [month, year] = paymentDetails.expiryDate.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            if (expiry < new Date()) {
                return 'البطاقة منتهية الصلاحية';
            }
            if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentDetails.expiryDate)) {
                return 'تاريخ انتهاء البطاقة غير صحيح';
            }

            // التحقق من CVV (3 أو 4 أرقام)
            if (!/^[0-9]{3,4}$/.test(paymentDetails.cvv)) {
                return 'رمز الأمان CVV غير صحيح';
            }
        }

        if (paymentMethod === PaymentMethodType.STC_PAY || 
            paymentMethod === PaymentMethodType.CASH_ON_DELIVERY) {
            if (!paymentDetails?.phone || !/^(05|5)([0-9]{8})$/.test(paymentDetails.phone)) {
                return 'رقم الجوال غير صحيح';
            }
        }

        return null;
    }

    async createOrder(orderData: CreateOrderDto): Promise<OrderResponseDto> {
        try {
            console.log('OrderService - creating order with data:', JSON.stringify(orderData));
            
            const validationError = await this.validatePaymentDetails(
                orderData.paymentMethod, 
                orderData.paymentDetails
            );
            
            if (validationError) {
                console.error('Validation error:', validationError);
                throw new Error(validationError);
            }
    
            console.log('Validation passed, sending to API');
            
            const response = await api.post<OrderResponseDto>(this.basePath, orderData);
            console.log('API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in createOrder:', error);
            
            if (error instanceof AxiosError) {
                if (error.response?.status === 400) {
                    throw new Error(error.response.data.detail || 'خطأ في البيانات المدخلة');
                }
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
                if (error.response?.status === 404) {
                    throw new Error('لم يتم العثور على الطلب');
                }
                if (error.response?.status === 500) {
                    throw new Error('حدث خطأ في النظام. الرجاء المحاولة مرة أخرى');
                }
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('حدث خطأ أثناء إنشاء الطلب');
        }
    }

    async getTopCustomers(limit: number = 10): Promise<TopCustomer[]> {
        try {
            const response = await api.get<TopCustomer[]>(
                `${this.basePath}/top-customers`,
                { params: { limit } }
            );
            
            return response.data.map(customer => {
                // التعامل مع التاريخ بحذر لتجنب الأخطاء
                let lastPurchaseDate;
                try {
                    // التحقق من أن lastPurchase ليس null أو undefined
                    if (customer.lastPurchase) {
                        // استخدام طريقة آمنة لتحويل التاريخ
                        lastPurchaseDate = new Date(customer.lastPurchase).toISOString();
                    } else {
                        // إذا كان التاريخ غير موجود، استخدم تاريخ اليوم
                        lastPurchaseDate = new Date().toISOString();
                    }
                } catch (error) {
                    console.error("Error parsing date:", error, customer.lastPurchase);
                    // استخدم تاريخ اليوم في حالة حدوث خطأ
                    lastPurchaseDate = new Date().toISOString();
                }
                
                return {
                    ...customer,
                    totalSpent: Number(customer.totalSpent || 0), // التأكد من أن القيمة رقمية
                    lastPurchase: lastPurchaseDate
                };
            });
        } catch (error) {
            console.error("Error fetching top customers:", error);
            throw handleApiError(error);
        }
    }

    async getOrder(id: number): Promise<OrderResponseDto> {
        try {
            const response = await api.get<OrderResponseDto>(`${this.basePath}/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
                if (error.response?.status === 404) {
                    throw new Error('لم يتم العثور على الطلب');
                }
                if (error.response?.status === 403) {
                    throw new Error('ليس لديك صلاحية للوصول إلى هذا الطلب');
                }
            }
            throw handleApiError(error);
        }
    }

    async getUserOrders(page: number = 1, pageSize: number = 10): Promise<{
        orders: OrderResponseDto[];
        totalCount: number;
        totalPages: number;
    }> {
        try {
            const response = await api.get<{
                orders: OrderResponseDto[];
                totalCount: number;
                totalPages: number;
            }>(this.basePath, {
                params: {
                    page,
                    pageSize
                }
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
            }
            throw handleApiError(error);
        }
    }

    async getAdminOrderDetails(id: number): Promise<OrderResponseDto> {
        try {
            const response = await api.get<{ order: OrderResponseDto, userInfo: any }>(`${this.basePath}/admin/orders/${id}`);
            return response.data.order; // إرجاع بيانات الطلب فقط
        } catch (error) {
            console.error('Error fetching order details:', error);
    
            if (error instanceof AxiosError) {
                switch (error.response?.status) {
                    case 401:
                        throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                    case 403:
                        throw new Error('ليس لديك صلاحية للوصول إلى هذا الطلب');
                    case 404:
                        throw new Error('لم يتم العثور على الطلب');
                    default:
                        throw new Error(`حدث خطأ أثناء جلب بيانات الطلب: ${error.message}`);
                }
            }
    
            throw handleApiError(error);
        }
    }

    async getAdminOrders(filter: OrderFilter): Promise<OrderPaginationResponse> {
        try {
            const response = await api.get<OrderPaginationResponse>(`${this.basePath}/admin/orders`, {
                params: {
                    page: filter.page,
                    pageSize: filter.pageSize,
                    status: filter.status,
                    fromDate: filter.fromDate,
                    toDate: filter.toDate,
                    search: filter.search,
                    paymentStatus: filter.paymentStatus,
                    paymentMethod: filter.paymentMethod,
                    minAmount: filter.minAmount,
                    maxAmount: filter.maxAmount,
                    sortBy: filter.sortBy,
                    sortOrder: filter.sortOrder,
                    city: filter.city
                }
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
                if (error.response?.status === 403) {
                    throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات');
                }
                if (error.response?.status === 500) {
                    throw new Error('حدث خطأ في النظام');
                }
            }
            throw handleApiError(error);
        }
    }

    async updateOrderStatus(orderId: number, status: OrderStatus): Promise<OrderResponseDto> {
        try {
            const response = await api.put<OrderResponseDto>(
                `${this.basePath}/admin/${orderId}/status`,
                { status }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
                if (error.response?.status === 403) {
                    throw new Error('ليس لديك صلاحية للقيام بهذا الإجراء');
                }
                if (error.response?.status === 404) {
                    throw new Error('لم يتم العثور على الطلب');
                }
            }
            throw handleApiError(error);
        }
    }

    async updatePaymentStatus(orderId: number, status: PaymentStatus): Promise<OrderResponseDto> {
        try {
            const response = await api.put<OrderResponseDto>(
                `${this.basePath}/admin/${orderId}/payment-status`,
                { status }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
                if (error.response?.status === 403) {
                    throw new Error('ليس لديك صلاحية للقيام بهذا الإجراء');
                }
                if (error.response?.status === 404) {
                    throw new Error('لم يتم العثور على الطلب');
                }
            }
            throw handleApiError(error);
        }
    }

    async cancelOrder(orderId: number): Promise<OrderResponseDto> {
        try {
            const response = await api.post<OrderResponseDto>(
                `${this.basePath}/${orderId}/cancel`
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
                if (error.response?.status === 403) {
                    throw new Error('لا يمكن إلغاء هذا الطلب');
                }
                if (error.response?.status === 404) {
                    throw new Error('لم يتم العثور على الطلب');
                }
            }
            throw handleApiError(error);
        }
    }

    async downloadInvoice(orderId: number): Promise<Blob> {
        try {
            const response = await api.get(`${this.basePath}/${orderId}/invoice`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
                if (error.response?.status === 404) {
                    throw new Error('لم يتم العثور على الفاتورة');
                }
            }
            throw handleApiError(error);
        }
    }

    async getOrdersStatistics(filter?: { fromDate?: string; toDate?: string }): Promise<{
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        processingOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        dailyOrders: { date: string; count: number; revenue: number }[];
    }> {
        try {
            console.log("Fetching orders statistics with filter:", filter);
            
            const response = await api.get(`${this.basePath}/statistics`, {
                params: filter
            });
            
            console.log("Received orders statistics:", response.data);
            
            if (!response.data) {
                console.warn("No data received from orders statistics API");
                throw new Error("لم يتم استلام بيانات من واجهة برمجة التطبيقات");
            }
            
            return response.data;
        } catch (error) {
            console.error("Error in getOrdersStatistics:", error);
            throw handleApiError(error);
        }
    }

    getOrderStatusText(status: OrderStatus): string {
        const statusMap: Record<OrderStatus, string> = {
            [OrderStatus.Pending]: 'قيد المراجعة',
            [OrderStatus.Processing]: 'جاري التجهيز',
            [OrderStatus.Shipped]: 'تم الشحن',
            [OrderStatus.Delivered]: 'تم التوصيل',
            [OrderStatus.Cancelled]: 'تم الإلغاء'
        };
        return statusMap[status] || status;
    }

    getPaymentStatusText(status: PaymentStatus): string {
        const statusMap: Record<PaymentStatus, string> = {
            [PaymentStatus.Pending]: 'في انتظار الدفع',
            [PaymentStatus.Processing]: 'جاري معالجة الدفع',
            [PaymentStatus.Completed]: 'تم الدفع',
            [PaymentStatus.Failed]: 'فشل الدفع',
            [PaymentStatus.Refunded]: 'تم الاسترجاع'
        };
        return statusMap[status] || status;
    }

    getPaymentMethodText(method: PaymentMethodType): string {
        const methodMap: Record<PaymentMethodType, string> = {
            [PaymentMethodType.CREDIT_CARD]: 'بطاقة ائتمانية',
            [PaymentMethodType.MADA]: 'مدى',
            [PaymentMethodType.APPLE_PAY]: 'آبل باي',
            [PaymentMethodType.GOOGLE_PAY]: 'جوجل باي',
            [PaymentMethodType.SAMSUNG_PAY]: 'سامسونج باي',
            [PaymentMethodType.STC_PAY]: 'STC Pay',
            [PaymentMethodType.CASH_ON_DELIVERY]: 'الدفع عند الاستلام',
            [PaymentMethodType.PAYPAL]: 'PayPal'
        };
        return methodMap[method] || method;
    }

    formatCardNumber(cardNumber: string): string {
        return cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    formatExpiryDate(value: string): string {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            const month = parseInt(cleaned.substring(0, 2));
            if (month > 12) {
                return '12/' + cleaned.slice(2, 4);
            }
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    }

    formatPhoneNumber(phone: string): string {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('5')) {
            return '0' + cleaned;
        }
        return cleaned;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    getOrderStatusColor(status: OrderStatus): string {
        const colorMap: Record<OrderStatus, string> = {
            [OrderStatus.Pending]: 'text-yellow-600 bg-yellow-50',
            [OrderStatus.Processing]: 'text-blue-600 bg-blue-50',
            [OrderStatus.Shipped]: 'text-purple-600 bg-purple-50',
            [OrderStatus.Delivered]: 'text-green-600 bg-green-50',
            [OrderStatus.Cancelled]: 'text-red-600 bg-red-50'
        };
        return colorMap[status] || 'text-gray-600 bg-gray-50';
    }

    getPaymentStatusColor(status: PaymentStatus): string {
        const colorMap: Record<PaymentStatus, string> = {
            [PaymentStatus.Pending]: 'text-yellow-600 bg-yellow-50',
            [PaymentStatus.Processing]: 'text-blue-600 bg-blue-50',
            [PaymentStatus.Completed]: 'text-green-600 bg-green-50',
            [PaymentStatus.Failed]: 'text-red-600 bg-red-50',
            [PaymentStatus.Refunded]: 'text-purple-600 bg-purple-50'
        };
        return colorMap[status] || 'text-gray-600 bg-gray-50';
    }

    canCancelOrder(order: OrderResponseDto): boolean {
        console.log("التحقق من إمكانية إلغاء الطلب:", order); // للتتبع
        if (!order) return false;
        
        // يمكن إلغاء الطلب فقط في حالة قيد المراجعة وخلال ساعة من إنشائه
        if (order.status !== 'Pending') {
            console.log("الطلب ليس في حالة المراجعة");
            return false;
        }
        
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        
        console.log("الفرق بالساعات:", hoursDiff);
        return ![OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Cancelled].includes(order.status as OrderStatus);
    }
}

export const orderService = new OrderService();