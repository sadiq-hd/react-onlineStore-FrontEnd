import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Package, Download, Search, ExternalLink, Filter, X } from 'lucide-react';
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
    const navigate = useNavigate();
    
    const handleViewOrderDetails = (orderId: number) => {
        navigate(`/admin/AdminOrderDetails/${orderId}`);
    };
    
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
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAdminOrders({
                ...filter,
                page: filter.page || 1,
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
        if (key === 'page' && value !== undefined) {
            const pageNumber = parseInt(value, 10);
            if (!isNaN(pageNumber)) {
                setFilter(prev => ({ ...prev, page: pageNumber }));
            }
        } else {
            setFilter(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : prev.page }));
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            if (!window.confirm('هل أنت متأكد من تغيير حالة الطلب؟')) {
                return;
            }
    
            setLoading(true);
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success('تم تحديث حالة الطلب بنجاح');
            await fetchOrders();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('فشل في تحديث حالة الطلب');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentStatusChange = async (orderId: number, newStatus: PaymentStatus) => {
        try {
            if (!window.confirm('هل أنت متأكد من تغيير حالة الدفع؟')) {
                return;
            }
    
            setLoading(true);
            await orderService.updatePaymentStatus(orderId, newStatus);
            toast.success('تم تحديث حالة الدفع بنجاح');
            await fetchOrders();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('فشل في تحديث حالة الدفع');
            }
        } finally {
            setLoading(false);
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

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 md:py-8">
            <div className="container mx-auto px-2 md:px-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center md:text-right">إدارة الطلبات</h1>

                {/* Search and Filters - Mobile First */}
                <div className="bg-white rounded-lg shadow p-3 md:p-6 mb-4 md:mb-6">
                    <form onSubmit={handleSearch} className="space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
                        <div className="flex items-center gap-2 col-span-4 md:col-span-1">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="البحث في الطلبات..."
                                    className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm md:text-base"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                            </div>
                            
                            {/* Filter Toggle Button for Mobile - Now Outside Input */}
                            <button
                                type="button"
                                onClick={toggleFilters}
                                className="md:hidden flex-none bg-gray-100 rounded-lg p-2 text-gray-500"
                                aria-label={showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
                            >
                                {showFilters ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
                            </button>
                        </div>
                        
                        <div className={`space-y-3 md:space-y-0 md:col-span-3 md:grid md:grid-cols-3 md:gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
                            <select
                                value={filter.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                                className="w-full border rounded-lg p-2 text-sm md:text-base"
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
                                className="w-full border rounded-lg p-2 text-sm md:text-base"
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
                                className="w-full border rounded-lg p-2 text-sm md:text-base"
                            >
                                <option value="">كل طرق الدفع</option>
                                {Object.values(PaymentMethodType).map((method) => (
                                    <option key={method} value={method}>
                                        {getPaymentMethodLabel(method)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={`flex gap-2 md:col-span-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm md:text-base flex-1 md:flex-none"
                            >
                                بحث
                            </button>

                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm md:text-base flex-1 md:flex-none"
                            >
                                إعادة تعيين
                            </button>
                        </div>
                    </form>
                </div>

                {/* Orders List */}
                <div className="space-y-3 md:space-y-4">
                    {ordersData.orders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
                            <Package className="h-8 w-8 md:h-12 md:w-12 mx-auto text-gray-400 mb-3 md:mb-4" />
                            <p className="text-gray-600 text-sm md:text-base">لا توجد طلبات تطابق معايير البحث</p>
                        </div>
                    ) : (
                        ordersData.orders.map((orderData) => (
                            <div 
                                key={orderData.order.id} 
                                className="bg-white rounded-lg shadow p-3 md:p-6 hover:shadow-lg transition"
                            >
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-0 mb-3 md:mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base md:text-lg font-semibold">طلب #{orderData.order.id}</span>
                                            <select
                                                value={orderData.order.status}
                                                onChange={(e) => handleStatusChange(orderData.order.id, e.target.value as OrderStatus)}
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm ${
                                                    orderService.getOrderStatusColor(orderData.order.status as OrderStatus)
                                                }`}
                                            >
                                                <option value={orderData.order.status}>{ORDER_STATUS_MAP[orderData.order.status]}</option>
                                                {Object.values(OrderStatus)
                                                    .filter(status => {
                                                        const currentStatus = orderData.order.status as OrderStatus;
                                                        switch (currentStatus) {
                                                            case OrderStatus.Pending:
                                                                return status === OrderStatus.Processing || status === OrderStatus.Cancelled;
                                                            case OrderStatus.Processing:
                                                                return status === OrderStatus.Shipped || status === OrderStatus.Cancelled;
                                                            case OrderStatus.Shipped:
                                                                return status === OrderStatus.Delivered || status === OrderStatus.Cancelled;
                                                            default:
                                                                return false;
                                                        }
                                                    })
                                                    .map((status) => (
                                                        <option key={status} value={status}>
                                                            {ORDER_STATUS_MAP[status]}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div className="text-xs md:text-sm text-gray-600 mt-1">
                                            {new Date(orderData.order.orderDate).toLocaleDateString('ar-SA')}
                                        </div>
                                    </div>
                                    <div className="md:text-left">
                                        <div className="font-bold text-green-600 text-sm md:text-base">
                                            {formatCurrency(orderData.order.finalAmount)}
                                        </div>
                                        <div className="flex flex-row md:flex-col gap-2 mt-2">
                                            <button
                                                onClick={() => handleDownloadInvoice(orderData.order.id)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs md:text-sm"
                                            >
                                                <Download className="h-3 w-3 md:h-4 md:w-4" />
                                                <span className="whitespace-nowrap">تحميل الفاتورة</span>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewOrderDetails(orderData.order.id);
                                                }}
                                                className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs md:text-sm"
                                            >
                                                <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                                                <span className="whitespace-nowrap">عرض التفاصيل</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 md:mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                                            <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">معلومات العميل</h3>
                                            <p className="text-xs md:text-sm text-gray-600">{orderData.userInfo.userName}</p>
                                            <p className="text-xs md:text-sm text-gray-600">{orderData.userInfo.userEmail}</p>
                                            <p className="text-xs md:text-sm text-gray-600">{orderData.userInfo.userPhone}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                                            <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">معلومات الشحن</h3>
                                            <p className="text-xs md:text-sm text-gray-600">{orderData.order.deliveryAddress.fullName}</p>
                                            <p className="text-xs md:text-sm text-gray-600">
                                                {orderData.order.deliveryAddress.city} - {orderData.order.deliveryAddress.street}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-600">{orderData.order.deliveryAddress.phoneNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-3 md:pt-4 mt-3 md:mt-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs md:text-sm">
                                            {getPaymentMethodLabel(orderData.order.paymentMethod)}
                                        </div>
                                        <select
                                            value={orderData.order.paymentStatus}
                                            onChange={(e) => handlePaymentStatusChange(orderData.order.id, e.target.value as PaymentStatus)}
                                            className={`text-xs md:text-sm p-1 rounded-full ${
                                                orderService.getPaymentStatusColor(orderData.order.paymentStatus as PaymentStatus)
                                            }`}
                                        >
                                            <option value={orderData.order.paymentStatus}>
                                                {getPaymentStatusLabel(orderData.order.paymentStatus)}
                                            </option>
                                            {Object.values(PaymentStatus)
                                                .filter(status => {
                                                    const currentStatus = orderData.order.paymentStatus as PaymentStatus;
                                                    switch (currentStatus) {
                                                        case PaymentStatus.Pending:
                                                            return status === PaymentStatus.Processing || status === PaymentStatus.Failed;
                                                        case PaymentStatus.Processing:
                                                            return status === PaymentStatus.Completed || status === PaymentStatus.Failed;
                                                        case PaymentStatus.Completed:
                                                            return status === PaymentStatus.Refunded;
                                                        case PaymentStatus.Failed:
                                                            return status === PaymentStatus.Processing;
                                                        default:
                                                            return false;
                                                    }
                                                })
                                                .map((status) => (
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

                {/* Pagination - Improved Mobile View */}
                {ordersData.pagination.totalPages > 1 && (
                    <div className="mt-4 md:mt-6 flex justify-center items-center gap-1 md:gap-2">
                        <button
                            onClick={() => handleFilterChange('page', Math.max(1, (filter.page || 1) - 1))}
                            disabled={ordersData.pagination.currentPage <= 1}
                            className="px-2 md:px-4 py-1 md:py-2 border rounded-lg disabled:opacity-50 text-xs md:text-sm"
                        >
                            السابق
                        </button>
                        <span className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm">
                            صفحة {ordersData.pagination.currentPage} من {ordersData.pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handleFilterChange('page', Math.min(ordersData.pagination.totalPages, (filter.page || 1) + 1))}
                            disabled={ordersData.pagination.currentPage >= ordersData.pagination.totalPages}
                            className="px-2 md:px-4 py-1 md:py-2 border rounded-lg disabled:opacity-50 text-xs md:text-sm"
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