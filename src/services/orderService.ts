import { AxiosError } from 'axios';
import api from '../config/axios';
import { 
    CreateOrderDto, 
    Order, 
    OrderResponseDto, 
    PaymentMethodType,
    OrderStatus,
    PaymentStatus
} from '../typerScript/order';

class OrderService {
    private readonly baseUrl = 'https://localhost:5000/api/Orders';

    async validatePaymentDetails(paymentMethod: PaymentMethodType, paymentDetails?: Record<string, string>): Promise<string | null> {
        if (paymentMethod === PaymentMethodType.CREDIT_CARD || 
            paymentMethod === PaymentMethodType.MADA) {
            if (!paymentDetails?.cardNumber || 
                !paymentDetails?.expiryDate || 
                !paymentDetails?.cvv) {
                return 'جميع بيانات البطاقة مطلوبة';
            }

            // التحقق من رقم البطاقة
            const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
            if (!/^\d{16}$/.test(cardNumber)) {
                return 'رقم البطاقة غير صحيح';
            }

            // التحقق من تاريخ الانتهاء
            if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentDetails.expiryDate)) {
                return 'تاريخ انتهاء البطاقة غير صحيح';
            }

            // التحقق من CVV
            if (!/^[0-9]{3}$/.test(paymentDetails.cvv)) {
                return 'رمز الأمان CVV غير صحيح';
            }
        }

        if (paymentMethod === PaymentMethodType.STC_PAY || 
            paymentMethod === PaymentMethodType.CASH_ON_DELIVERY) {
            if (!paymentDetails?.phone || !/^05\d{8}$/.test(paymentDetails.phone)) {
                return 'رقم الجوال غير صحيح';
            }
        }

        return null;
    }

    async createOrder(orderData: CreateOrderDto): Promise<OrderResponseDto> {
        try {
            // التحقق من بيانات الدفع قبل إرسال الطلب
            const validationError = await this.validatePaymentDetails(
                orderData.paymentMethod, 
                orderData.paymentDetails
            );
            
            if (validationError) {
                throw new Error(validationError);
            }

            const response = await api.post<OrderResponseDto>(this.baseUrl, orderData);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 400) {
                    throw new Error(error.response.data || 'خطأ في البيانات المدخلة');
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

    async getOrder(id: number): Promise<OrderResponseDto> {
        try {
            const response = await api.get<OrderResponseDto>(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
                if (error.response?.status === 404) {
                    throw new Error('لم يتم العثور على الطلب');
                }
            }
            throw new Error('حدث خطأ أثناء جلب بيانات الطلب');
        }
    }

    async getUserOrders(): Promise<OrderResponseDto[]> {
        try {
            const response = await api.get<OrderResponseDto[]>(this.baseUrl);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    throw new Error('الرجاء تسجيل الدخول مرة أخرى');
                }
            }
            throw new Error('حدث خطأ أثناء جلب الطلبات');
        }
    }

    // تحويل حالة الطلب إلى نص مناسب
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

    // تحويل حالة الدفع إلى نص مناسب
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

    // تحويل طريقة الدفع إلى نص مناسب
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

    // تنسيق رقم البطاقة بإضافة مسافات
    formatCardNumber(cardNumber: string): string {
        return cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // تنسيق تاريخ الانتهاء بإضافة /
    formatExpiryDate(value: string): string {
        const cleaned = value.replace(/\D/g, '');
        const limited = cleaned.slice(0, 4);
        
        if (limited.length >= 2) {
            return limited.slice(0, 2) + '/' + limited.slice(2);
        }
        
        return limited;
    }

    // تنسيق المبالغ بالريال السعودي
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(amount);
    }

    // الحصول على لون حالة الطلب للواجهة
    getOrderStatusColor(status: OrderStatus): string {
        const colorMap: Record<OrderStatus, string> = {
            [OrderStatus.Pending]: 'text-yellow-600',
            [OrderStatus.Processing]: 'text-blue-600',
            [OrderStatus.Shipped]: 'text-purple-600',
            [OrderStatus.Delivered]: 'text-green-600',
            [OrderStatus.Cancelled]: 'text-red-600'
        };
        return colorMap[status] || 'text-gray-600';
    }

    // الحصول على لون حالة الدفع للواجهة
    getPaymentStatusColor(status: PaymentStatus): string {
        const colorMap: Record<PaymentStatus, string> = {
            [PaymentStatus.Pending]: 'text-yellow-600',
            [PaymentStatus.Processing]: 'text-blue-600',
            [PaymentStatus.Completed]: 'text-green-600',
            [PaymentStatus.Failed]: 'text-red-600',
            [PaymentStatus.Refunded]: 'text-purple-600'
        };
        return colorMap[status] || 'text-gray-600';
    }
}

export const orderService = new OrderService();