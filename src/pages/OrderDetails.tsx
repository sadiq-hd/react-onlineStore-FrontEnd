import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { OrderResponseDto, OrderStatus, ORDER_STATUS_MAP, OrderItemDto } from '../typerScript/order';
import { toast } from 'react-toastify';

const OrderDetails: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderResponseDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) {
                navigate('/orders');
                return;
            }
            
            try {
                setLoading(true);
                const orderId = Number(id);
                if (isNaN(orderId)) {
                    throw new Error('رقم الطلب غير صحيح');
                }
                const data = await orderService.getOrder(orderId);
                setOrder(data);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'فشل في تحميل تفاصيل الطلب';
                toast.error(errorMessage);
                navigate('/orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, navigate]);

    const getStatusClass = (status: string) => {
        switch (status) {
            case OrderStatus.Delivered:
                return 'bg-green-100 text-green-800';
            case OrderStatus.Cancelled:
                return 'bg-red-100 text-red-800';
            case OrderStatus.Processing:
                return 'bg-blue-100 text-blue-800';
            case OrderStatus.Shipped:
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">لم يتم العثور على الطلب</h2>
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        العودة للطلبات
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    {/* رأس الصفحة */}
                    <div className="mb-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">تفاصيل الطلب #{order.id}</h1>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
                            {ORDER_STATUS_MAP[order.status as OrderStatus]}
                        </span>
                    </div>

                    {/* المنتجات */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">المنتجات</h2>
                        <div className="space-y-6">
                            {order.items.map((item: OrderItemDto) => (
                                <div key={item.productId} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <h3 className="font-medium">{item.productName}</h3>
                                        <p className="text-sm text-gray-600">
                                            الكمية: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">
                                            {orderService.formatCurrency(item.price)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            المبلغ: {orderService.formatCurrency(item.total)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                    شامل الضريبة: {item.totalWithVat !== undefined 
                        ? orderService.formatCurrency(item.totalWithVat)
                        : orderService.formatCurrency(item.total * 1.15)}
                </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* الإجمالي */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>المجموع الفرعي:</span>
                                <span>{order.subTotal ? orderService.formatCurrency(order.subTotal) : '--'}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>ضريبة القيمة المضافة (15%):</span>
                                <span>{order.vatAmount ? orderService.formatCurrency(order.vatAmount) : '--'}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>رسوم التوصيل:</span>
                                <span>{order.deliveryFee ? orderService.formatCurrency(order.deliveryFee) : '--'}</span>
                            </div>
                            <div className="pt-3 border-t flex justify-between items-center">
                                <span className="text-lg font-semibold">المبلغ الإجمالي</span>
                                <span className="text-lg font-bold text-green-600">
                                    {order.finalAmount ? orderService.formatCurrency(order.finalAmount) : '--'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="mt-8 flex justify-end space-x-4 space-x-reverse">
                        <button
                            onClick={() => navigate('/orders')}
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            العودة للطلبات
                        </button>
                        {order.status === OrderStatus.Pending && (
                            <button
                                onClick={() => {/* يمكن إضافة وظيفة إلغاء الطلب هنا */}}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                إلغاء الطلب
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;