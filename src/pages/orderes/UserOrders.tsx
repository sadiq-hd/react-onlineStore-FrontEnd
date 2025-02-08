import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { OrderStatus, OrderPaginationResponse } from '../../typerScript/order';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';

const DEFAULT_PAGE_SIZE = 10;

const UserOrders = () => {
    const navigate = useNavigate();
    const [ordersData, setOrdersData] = useState<OrderPaginationResponse>({
        orders: [],
        pagination: {
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
            totalItems: 0,
            totalPages: 0
        },
        filters: {
            status: null,
            fromDate: null,
            toDate: null
        }
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getUserOrders(currentPage, DEFAULT_PAGE_SIZE);
            
            if (!response || !response.orders) {
                throw new Error('لم يتم استلام بيانات صحيحة من الخادم');
            }
    
            // تحويل البيانات المستلمة إلى الشكل المطلوب
            const formattedData: OrderPaginationResponse = {
                orders: response.orders.map(order => ({
                    order: {
                        id: order.id,
                        status: order.status,
                        orderDate: order.orderDate,
                        subTotal: order.subTotal,
                        vatAmount: order.vatAmount,
                        totalAmount: order.totalAmount,
                        deliveryFee: order.deliveryFee,
                        finalAmount: order.finalAmount,
                        paymentStatus: order.paymentStatus,
                        paymentMethod: order.paymentMethod,
                        items: order.items || [],
                        deliveryAddress: order.deliveryAddress,
                        paymentDetails: order.paymentDetails
                    },
                    userInfo: {
                        userId: String(order.id), // استخدام ID الطلب كبديل مؤقت
                        userName: order.deliveryAddress?.fullName || 'مستخدم',
                        userEmail: 'user@example.com', // قيمة افتراضية
                        userPhone: order.deliveryAddress?.phoneNumber || ''
                    }
                })),
                pagination: {
                    currentPage: currentPage,
                    pageSize: DEFAULT_PAGE_SIZE,
                    totalItems: response.totalCount || 0,
                    totalPages: response.totalPages || 1
                },
                filters: {
                    status: null,
                    fromDate: null,
                    toDate: null
                }
            };
    
            setOrdersData(formattedData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('فشل في تحميل الطلبات');
            // عند حدوث خطأ، نقوم بتعيين حالة افتراضية فارغة
            setOrdersData({
                orders: [],
                pagination: {
                    currentPage: 1,
                    pageSize: DEFAULT_PAGE_SIZE,
                    totalItems: 0,
                    totalPages: 1
                },
                filters: {
                    status: null,
                    fromDate: null,
                    toDate: null
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Pending: return <Clock className="h-5 w-5" />;
            case OrderStatus.Processing: return <Package className="h-5 w-5" />;
            case OrderStatus.Shipped: return <ShoppingBag className="h-5 w-5" />;
            case OrderStatus.Delivered: return <CheckCircle className="h-5 w-5" />;
            case OrderStatus.Cancelled: return <XCircle className="h-5 w-5" />;
            default: return <Clock className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (ordersData.orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">لا توجد طلبات حالياً</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        تصفح المنتجات
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">طلباتي</h1>

                <div className="space-y-4">
                    {ordersData.orders.map((orderData) => (
                        <div
                            key={orderData.order.id}
                            onClick={() => navigate(`/orders/${orderData.order.id}`)}
                            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold">طلب #{orderData.order.id}</span>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                                            orderService.getOrderStatusColor(orderData.order.status)
                                        }`}>
                                            {getStatusIcon(orderData.order.status)}
                                            {orderService.getOrderStatusText(orderData.order.status)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {new Date(orderData.order.orderDate).toLocaleDateString('ar-SA', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-green-600">
                                        {orderService.formatCurrency(orderData.order.finalAmount)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-sm text-gray-600 mb-2">
                                    عدد المنتجات: {orderData.order.items.length}
                                </div>
                                <div className="space-y-1">
                                    {orderData.order.items.slice(0, 2).map((item) => (
                                        <p key={item.productId} className="text-sm text-gray-600">
                                            {item.productName} × {item.quantity}
                                        </p>
                                    ))}
                                    {orderData.order.items.length > 2 && (
                                        <p className="text-sm text-gray-500">
                                            و {orderData.order.items.length - 2} منتجات أخرى
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm">
                                        {orderService.getPaymentMethodText(orderData.order.paymentMethod)}
                                    </div>
                                    <div className="text-sm">
                                        حالة الدفع: <span className={orderService.getPaymentStatusColor(orderData.order.paymentStatus)}>
                                            {orderService.getPaymentStatusText(orderData.order.paymentStatus)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {ordersData.pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            السابق
                        </button>
                        <span className="px-4 py-2">
                            صفحة {ordersData.pagination.currentPage} من {ordersData.pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= ordersData.pagination.totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrders;