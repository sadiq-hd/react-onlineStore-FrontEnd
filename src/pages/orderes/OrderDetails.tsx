import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Download, AlertTriangle } from 'lucide-react';
import { OrderResponseDto, OrderStatus, PaymentStatus } from '../../typerScript/order';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import useAuth from '../../typerScript/useAuth';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [order, setOrder] = useState<OrderResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getOrder(Number(id));
            setOrder(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'فشل في تحميل تفاصيل الطلب';
            setError(errorMessage);
            toast.error(errorMessage);
            // التوجيه للصفحة المناسبة بناءً على نوع الخطأ
            if (error instanceof Error && error.message.includes('صلاحية')) {
                navigate('/unauthorized', { replace: true });
            } else {
                navigate(isAdmin ? '/admin/AdminOrders' : '/admin/AdminOrders', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
                    <button
                        onClick={() => navigate(isAdmin ? '/admin/AdminOrders' : '/admin/AdminOrders')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        العودة للطلبات
                    </button>
                </div>
            </div>
        );
    }

    const handleCancelOrder = async () => {
        console.log("تم الضغط على زر الإلغاء"); // للتأكد من أن الدالة تعمل
        if (!order || !id || !window.confirm('هل أنت متأكد من إلغاء الطلب؟')) return;
    
        try {
            setCancelLoading(true);
            if (isAdmin) {
                console.log("محاولة إلغاء كمسؤول"); // للتتبع
                await orderService.updateOrderStatus(Number(id), OrderStatus.Cancelled);
            } else {
                console.log("محاولة إلغاء كمستخدم عادي"); // للتتبع
                await orderService.cancelOrder(Number(id));
            }
            toast.success('تم إلغاء الطلب بنجاح');
            fetchOrderDetails();
        } catch (error) {
            console.error("خطأ في إلغاء الطلب:", error); // لتتبع الخطأ
            toast.error('فشل في إلغاء الطلب');
        } finally {
            setCancelLoading(false);
        }
    };


    const handleUpdateOrderStatus = async (newStatus: OrderStatus) => {
        if (!id || !order) return;

        try {
            await orderService.updateOrderStatus(Number(id), newStatus);
            toast.success('تم تحديث حالة الطلب بنجاح');
            fetchOrderDetails();
        } catch (error) {
            toast.error('فشل في تحديث حالة الطلب');
        }
    };

    const handleDownloadInvoice = async () => {
        if (!id) return;
        try {
            const blob = await orderService.downloadInvoice(Number(id));
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('فشل في تحميل الفاتورة');
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Pending: return <Clock className="h-5 w-5" />;
            case OrderStatus.Processing: return <Package className="h-5 w-5" />;
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

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">لم يتم العثور على الطلب</h2>
                    <button
                        onClick={() => navigate(isAdmin ? '/admin/orders' : '/AdminOrders')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        العودة للطلبات
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate(isAdmin ? '/admin/AdminOrders' : '/UserOrders')}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                        ← العودة للطلبات
                    </button>
                    
                    <button
                        onClick={handleDownloadInvoice}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Download className="h-5 w-5" />
                        تحميل الفاتورة
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                تفاصيل الطلب #{order.id}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {new Date(order.orderDate).toLocaleDateString('ar-SA', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm ${
                            order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' :
                            order.status === OrderStatus.Cancelled ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {getStatusIcon(order.status as OrderStatus)}
                            {orderService.getOrderStatusText(order.status as OrderStatus)}
                        </div>
                    </div>

                    {/* Alert for Pending Orders */}
                    {orderService.canCancelOrder(order) && (
    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800 font-medium">
            <AlertTriangle className="h-5 w-5" />
            يمكنك إلغاء الطلب
        </div>
        <p className="text-yellow-700 mt-1">
            يمكنك إلغاء الطلب في أي وقت قبل شحنه
        </p>
    </div>
)}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* تفاصيل العميل */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-4">تفاصيل العميل</h3>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="text-gray-600">الاسم:</span>{' '}
                                    {order.deliveryAddress.fullName}
                                </p>
                                <p className="text-sm">
                                    <span className="text-gray-600">رقم الهاتف:</span>{' '}
                                    {order.deliveryAddress.phoneNumber}
                                </p>
                                <p className="text-sm">
                                    <span className="text-gray-600">العنوان:</span>{' '}
                                    {`${order.deliveryAddress.city}${order.deliveryAddress.street ? ` - ${order.deliveryAddress.street}` : ''}`}
                                </p>
                            </div>
                        </div>

                        {/* تفاصيل الدفع */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-4">تفاصيل الدفع</h3>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="text-gray-600">طريقة الدفع:</span>{' '}
                                    {orderService.getPaymentMethodText(order.paymentMethod)}
                                </p>
                                <p className="text-sm">
                                    <span className="text-gray-600">حالة الدفع:</span>{' '}
                                    <span className={orderService.getPaymentStatusColor(order.paymentStatus as PaymentStatus)}>
                                        {orderService.getPaymentStatusText(order.paymentStatus as PaymentStatus)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                                        المنتج
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                                        الكمية
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                                        السعر
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                                        الإجمالي
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {order.items.map((item) => (
                                    <tr key={item.productId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.productName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {orderService.formatCurrency(item.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {orderService.formatCurrency(item.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-8 border-t pt-6">
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/3">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">المجموع الفرعي:</span>
                                        <span>{orderService.formatCurrency(order.subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">ضريبة القيمة المضافة (15%):</span>
                                        <span>{orderService.formatCurrency(order.vatAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">رسوم التوصيل:</span>
                                        <span>{orderService.formatCurrency(order.deliveryFee)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-3 border-t">
                                        <span>الإجمالي:</span>
                                        <span className="text-green-600">
                                            {orderService.formatCurrency(order.finalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* زر إلغاء الطلب */}
                    
                    {orderService.canCancelOrder(order) && (
    <div className="mt-8 border-t pt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
            * لا يمكن إلغاء الطلب بعد شحنه
        </div>
        <button
            onClick={handleCancelOrder}
            disabled={cancelLoading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 
                      transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                      flex items-center gap-2"
        >
            <XCircle className="h-5 w-5" />
            {cancelLoading ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
        </button>
    </div>
)}

                    {/* قسم تحديث حالة الطلب (للمسؤول فقط) */}
                    {isAdmin && (
                        <div className="mt-8 border-t pt-6">
                            <h3 className="font-semibold mb-4">تحديث حالة الطلب</h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleUpdateOrderStatus(OrderStatus.Processing)}
                                    disabled={order.status !== OrderStatus.Pending}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    بدء المعالجة
                                </button>
                                <button
                                    onClick={() => handleUpdateOrderStatus(OrderStatus.Shipped)}
                                    disabled={order.status !== OrderStatus.Processing}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    تم الشحن
                                </button>
                                <button
                                    onClick={() => handleUpdateOrderStatus(OrderStatus.Delivered)}
                                    disabled={order.status !== OrderStatus.Shipped}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    تم التوصيل
                                </button>
                                <button
                                    onClick={() => handleUpdateOrderStatus(OrderStatus.Cancelled)}
                                    disabled={order.status === OrderStatus.Delivered || order.status === OrderStatus.Cancelled}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    إلغاء الطلب
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;