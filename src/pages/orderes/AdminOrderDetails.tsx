// src/pages/orderes/AdminOrderDetails.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Download, AlertTriangle, Truck } from 'lucide-react';
import { OrderResponseDto, OrderStatus, PaymentStatus, PaymentMethodType } from '../../typerScript/order';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

            // استدعاء تفاصيل الطلب الخاص بالأدمن فقط
            const data = await orderService.getAdminOrderDetails(Number(id));
            setOrder(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'فشل في تحميل تفاصيل الطلب';
            setError(errorMessage);
            toast.error(errorMessage);
            navigate('/admin/AdminOrders', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || !id || !window.confirm('هل أنت متأكد من إلغاء الطلب؟')) return;

        try {
            setCancelLoading(true);
            await orderService.updateOrderStatus(Number(id), OrderStatus.Cancelled);
            toast.success('تم إلغاء الطلب بنجاح');
            fetchOrderDetails();
        } catch (error) {
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

    const handleUpdatePaymentStatus = async (newStatus: PaymentStatus) => {
        if (!id || !order) return;
    
        try {
            // إضافة تأكيد قبل التحديث
            if (!window.confirm('هل أنت متأكد من تغيير حالة الدفع؟')) {
                return;
            }
    
            // استدعاء API لتحديث حالة الدفع
            await orderService.updatePaymentStatus(Number(id), newStatus);
            toast.success('تم تحديث حالة الدفع بنجاح');
            
            // إعادة تحميل بيانات الطلب
            fetchOrderDetails();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'فشل في تحديث حالة الدفع';
            toast.error(errorMessage);
        }
    };

    const getAvailablePaymentStatusOptions = (currentStatus: PaymentStatus): PaymentStatus[] => {
        switch (currentStatus) {
            case PaymentStatus.Pending:
                return [PaymentStatus.Processing, PaymentStatus.Failed];
            case PaymentStatus.Processing:
                return [PaymentStatus.Completed, PaymentStatus.Failed];
            case PaymentStatus.Completed:
                return [PaymentStatus.Refunded];
            case PaymentStatus.Failed:
                return [PaymentStatus.Processing];
            default:
                return [];
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
            case OrderStatus.Pending: 
                return <Clock className="h-5 w-5" />;
            case OrderStatus.Processing: 
                return <Package className="h-5 w-5" />;
            case OrderStatus.Shipped: 
                return <Truck className="h-5 w-5" />;
            case OrderStatus.Delivered: 
                return <CheckCircle className="h-5 w-5" />;
            case OrderStatus.Cancelled: 
                return <XCircle className="h-5 w-5" />;
            default: 
                return <Clock className="h-5 w-5" />;
        }
    };

    // صياغة العملة بشكل صحيح
    const formatCurrency = (amount: number): string => {
        return `${amount.toFixed(2)} ر.س`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
                    <button
                        onClick={() => navigate('/admin/AdminOrders')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        العودة للطلبات
                    </button>
                </div>
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
                        onClick={() => navigate('/admin/AdminOrders')}
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
                        onClick={() => navigate('/admin/AdminOrders')}
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
                            order.status === OrderStatus.Shipped ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {getStatusIcon(order.status)}
                            {orderService.getOrderStatusText(order.status)}
                        </div>
                    </div>

                    {/* معلومات المستخدم - بناء على النموذج الجديد */}
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
                        </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* تفاصيل الشحن */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-4">عنوان التوصيل</h3>
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
                                    <span className="text-gray-600">المدينة:</span>{' '}
                                    {order.deliveryAddress.city}
                                </p>
                                {order.deliveryAddress.street && (
                                    <p className="text-sm">
                                        <span className="text-gray-600">الشارع:</span>{' '}
                                        {order.deliveryAddress.street}
                                    </p>
                                )}
                                {order.deliveryAddress.buildingNumber && (
                                    <p className="text-sm">
                                        <span className="text-gray-600">رقم المبنى:</span>{' '}
                                        {order.deliveryAddress.buildingNumber}
                                    </p>
                                )}
                                {order.deliveryAddress.additionalDetails && (
                                    <p className="text-sm">
                                        <span className="text-gray-600">تفاصيل إضافية:</span>{' '}
                                        {order.deliveryAddress.additionalDetails}
                                    </p>
                                )}
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
                                    <span className={orderService.getPaymentStatusColor(order.paymentStatus)}>
                                        {orderService.getPaymentStatusText(order.paymentStatus)}
                                    </span>
                                </p>
                                {order.paymentDetails?.transactionId && (
                                    <p className="text-sm">
                                        <span className="text-gray-600">رقم العملية:</span>{' '}
                                        {order.paymentDetails.transactionId}
                                    </p>
                                )}
                                {order.paymentDetails?.paidAt && (
                                    <p className="text-sm">
                                        <span className="text-gray-600">تاريخ الدفع:</span>{' '}
                                        {new Date(order.paymentDetails.paidAt).toLocaleDateString('ar-SA')}
                                    </p>
                                )}
                                
                                {/* إضافة معلومات كود الخصم إذا كان موجودًا */}
                                {order.promoCode && (
                                    <p className="text-sm text-green-600">
                                        <span className="text-gray-600">كود الخصم:</span>{' '}
                                        {order.promoCode}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="overflow-x-auto mb-8">
                        <h3 className="font-semibold mb-4">المنتجات</h3>
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
                                        السعر الأصلي
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                                        السعر بعد الخصم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                                        الخصم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                                        الإجمالي
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {order.items.map((item) => {
                                    const hasDiscount = item.originalPrice !== undefined && item.price < item.originalPrice;
                                    const originalItemPrice = item.originalPrice || item.price;
                                    const discountAmount = hasDiscount ? (originalItemPrice - item.price) : 0;
                                    
                                    return (
                                        <tr key={item.productId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.productName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {hasDiscount 
                                                    ? <span className="line-through text-gray-500">{formatCurrency(originalItemPrice)}</span>
                                                    : formatCurrency(item.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {hasDiscount 
                                                    ? <span className="text-green-600">{formatCurrency(item.price)}</span>
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                {hasDiscount 
                                                    ? `-${formatCurrency(discountAmount)}`
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                        <span>{formatCurrency(order.subTotal)}</span>
                                    </div>
                                    
                                    {order.discountAmount && order.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>الخصم:</span>
                                            <span>- {formatCurrency(order.discountAmount)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">ضريبة القيمة المضافة (15%):</span>
                                        <span>{formatCurrency(order.vatAmount)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">رسوم التوصيل:</span>
                                        <span>{formatCurrency(order.deliveryFee)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between font-bold text-lg pt-3 border-t">
                                        <span>الإجمالي:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(order.finalAmount)}
                                        </span>
                                    </div>
                                    
                                    <div className="text-xs text-gray-500">
                                        * الأسعار تشمل ضريبة القيمة المضافة (15%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* زر إلغاء الطلب */}
                    {order.status !== OrderStatus.Cancelled && order.status !== OrderStatus.Delivered && (
                        <div className="mt-8 border-t pt-6 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                * لا يمكن إلغاء الطلب بعد توصيله
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
                    <div className="mt-8 border-t pt-6">
                        <h3 className="font-semibold mb-4">تحديث حالة الطلب</h3>
                        <div className="flex flex-wrap gap-4">
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

                    {/* قسم تحديث حالة الدفع */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="font-semibold mb-4">تحديث حالة الدفع</h3>
                        <div className="flex flex-wrap gap-4">
                            {getAvailablePaymentStatusOptions(order.paymentStatus).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleUpdatePaymentStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                                        status === PaymentStatus.Completed ? 'bg-green-600 hover:bg-green-700' :
                                        status === PaymentStatus.Processing ? 'bg-blue-600 hover:bg-blue-700' :
                                        status === PaymentStatus.Failed ? 'bg-red-600 hover:bg-red-700' :
                                        status === PaymentStatus.Refunded ? 'bg-purple-600 hover:bg-purple-700' :
                                        'bg-gray-600 hover:bg-gray-700'
                                    }`}
                                >
                                    {orderService.getPaymentStatusText(status)}
                                </button>
                            ))}
                            {getAvailablePaymentStatusOptions(order.paymentStatus).length === 0 && (
                                <p className="text-gray-600 italic">لا توجد تحديثات متاحة لحالة الدفع الحالية</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AdminOrderDetails;