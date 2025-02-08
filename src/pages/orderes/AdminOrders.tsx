import { useEffect, useState } from 'react';
import { Package, Download, Search } from 'lucide-react';
import { 
    OrderStatus, 
    PaymentStatus,
    PaymentMethodType,
    OrderFilter,
    OrderPaginationResponse,
    ORDER_STATUS_MAP,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
    formatCurrency
} from '../../typerScript/order';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';

const DEFAULT_PAGE_SIZE = 10;

const AdminOrders = () => {
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
    
    const [filter, setFilter] = useState<OrderFilter>({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        sortBy: 'orderDate',
        sortOrder: 'desc'
    });
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAdminOrders({
                ...filter,
                search: searchTerm || undefined
            });
            setOrdersData(response);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('فشل في تحميل الطلبات');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilter(prev => ({ ...prev, page: 1 }));
        fetchOrders();
    };

    const handleFilterChange = (key: keyof OrderFilter, value: any) => {
        setFilter(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success('تم تحديث حالة الطلب بنجاح');
            fetchOrders();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('فشل في تحديث حالة الطلب');
            }
        }
    };

    const handlePaymentStatusChange = async (orderId: number, newStatus: PaymentStatus) => {
        try {
            await orderService.updatePaymentStatus(orderId, newStatus);
            toast.success('تم تحديث حالة الدفع بنجاح');
            fetchOrders();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('فشل في تحديث حالة الدفع');
            }
        }
    };

    const handleDownloadInvoice = async (orderId: number) => {
        try {
            const blob = await orderService.downloadInvoice(orderId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('تم تحميل الفاتورة بنجاح');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('فشل في تحميل الفاتورة');
            }
        }
    };

    const handleResetFilter = () => {
        setFilter({
            page: 1,
            pageSize: DEFAULT_PAGE_SIZE,
            sortBy: 'orderDate',
            sortOrder: 'desc'
        });
        setSearchTerm('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">إدارة الطلبات</h1>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="البحث في الطلبات..."
                                className="w-full border rounded-lg pl-10 pr-4 py-2"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        
                        <select
                            value={filter.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                            className="border rounded-lg p-2"
                        >
                            <option value="">كل الحالات</option>
                            {Object.entries(ORDER_STATUS_MAP).map(([status, label]) => (
                                <option key={status} value={status}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filter.paymentStatus || ''}
                            onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
                            className="border rounded-lg p-2"
                        >
                            <option value="">كل حالات الدفع</option>
                            {Object.values(PaymentStatus).map((status) => (
                                <option key={status} value={status}>
                                    {getPaymentStatusLabel(status)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filter.paymentMethod || ''}
                            onChange={(e) => handleFilterChange('paymentMethod', e.target.value || undefined)}
                            className="border rounded-lg p-2"
                        >
                            <option value="">كل طرق الدفع</option>
                            {Object.values(PaymentMethodType).map((method) => (
                                <option key={method} value={method}>
                                    {getPaymentMethodLabel(method)}
                                </option>
                            ))}
                        </select>

                        <div className="col-span-4 flex gap-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                بحث
                            </button>

                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                                إعادة تعيين
                            </button>
                        </div>
                    </form>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {ordersData.orders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">لا توجد طلبات تطابق معايير البحث</p>
                        </div>
                    ) : (
                        ordersData.orders.map((orderData) => (
                            <div key={orderData.order.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold">طلب #{orderData.order.id}</span>
                                            <select
                                                value={orderData.order.status}
                                                onChange={(e) => handleStatusChange(orderData.order.id, e.target.value as OrderStatus)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                                    orderService.getOrderStatusColor(orderData.order.status)
                                                }`}
                                            >
                                                {Object.values(OrderStatus).map((status) => (
                                                    <option key={status} value={status}>
                                                        {ORDER_STATUS_MAP[status]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {new Date(orderData.order.orderDate).toLocaleDateString('ar-SA')}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-green-600">
                                            {formatCurrency(orderData.order.finalAmount)}
                                        </div>
                                        <button
                                            onClick={() => handleDownloadInvoice(orderData.order.id)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            تحميل الفاتورة
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-semibold mb-2">معلومات العميل</h3>
                                            <p className="text-sm text-gray-600">{orderData.userInfo.userName}</p>
                                            <p className="text-sm text-gray-600">{orderData.userInfo.userEmail}</p>
                                            <p className="text-sm text-gray-600">{orderData.userInfo.userPhone}</p>

                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">معلومات الشحن</h3>
                                            <p className="text-sm text-gray-600">{orderData.order.deliveryAddress.fullName}</p>
                                            <p className="text-sm text-gray-600">
                                                {orderData.order.deliveryAddress.city} - {orderData.order.deliveryAddress.street}
                                            </p>
                                            <p className="text-sm text-gray-600">{orderData.order.deliveryAddress.phoneNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm">
                                            {getPaymentMethodLabel(orderData.order.paymentMethod)}
                                        </div>
                                        <select
                                            value={orderData.order.paymentStatus}
                                            onChange={(e) => handlePaymentStatusChange(orderData.order.id, e.target.value as PaymentStatus)}
                                            className={`text-sm ${
                                                orderService.getPaymentStatusColor(orderData.order.paymentStatus)
                                            }`}
                                        >
                                            {Object.values(PaymentStatus).map((status) => (
                                                <option key={status} value={status}>
                                                    {getPaymentStatusLabel(status)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {ordersData.pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        <button
                            onClick={() => handleFilterChange('page', filter.page! - 1)}
                            disabled={ordersData.pagination.currentPage <= 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            السابق
                        </button>
                        <span className="px-4 py-2">
                            صفحة {ordersData.pagination.currentPage} من {ordersData.pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handleFilterChange('page', filter.page! + 1)}
                            disabled={ordersData.pagination.currentPage >= ordersData.pagination.totalPages}
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

export default AdminOrders;