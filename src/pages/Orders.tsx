import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { 
    OrderResponseDto, 
    OrderStatus, 
    PaymentStatus
} from '../typerScript/order';
import { toast } from 'react-toastify';
import { ShoppingBag, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const Orders: FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await orderService.getUserOrders();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error(error instanceof Error ? error.message : 'فشل في تحميل الطلبات');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Pending:
                return <Clock className="h-5 w-5" />;
            case OrderStatus.Processing:
                return <Package className="h-5 w-5" />;
            case OrderStatus.Shipped:
                return <ShoppingBag className="h-5 w-5" />;
            case OrderStatus.Delivered:
                return <CheckCircle className="h-5 w-5" />;
            case OrderStatus.Cancelled:
                return <XCircle className="h-5 w-5" />;
            default:
                return <Clock className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (orders.length === 0) {
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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">طلباتي</h1>
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <span>طلب #{order.id}</span>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                                            order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' :
                                            order.status === OrderStatus.Cancelled ? 'bg-red-100 text-red-800' :
                                            order.status === OrderStatus.Shipped ? 'bg-purple-100 text-purple-800' :
                                            order.status === OrderStatus.Processing ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {getStatusIcon(order.status as OrderStatus)}
                                            {orderService.getOrderStatusText(order.status as OrderStatus)}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date(order.orderDate).toLocaleDateString('ar-SA', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* معلومات المنتجات */}
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    عدد المنتجات: {order.items.length}
                                </p>
                                <div className="space-y-2">
                                    {order.items.slice(0, 2).map((item) => (
                                        <p key={item.productId} className="text-sm text-gray-600">
                                            {item.productName} × {item.quantity}
                                        </p>
                                    ))}
                                    {order.items.length > 2 && (
                                        <p className="text-sm text-gray-500">
                                            و {order.items.length - 2} منتجات أخرى
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* معلومات الدفع */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-600">طريقة الدفع</span>
                                        <span className="font-medium">
                                            {orderService.getPaymentMethodText(order.paymentMethod)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-gray-600">حالة الدفع</span>
                                        <span className={`font-medium ${orderService.getPaymentStatusColor(order.paymentStatus as PaymentStatus)}`}>
                                            {orderService.getPaymentStatusText(order.paymentStatus as PaymentStatus)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* المبلغ الإجمالي */}
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="font-semibold">المبلغ الإجمالي</span>
                                <span className="font-bold text-green-600">
                                    {orderService.formatCurrency(order.finalAmount)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;