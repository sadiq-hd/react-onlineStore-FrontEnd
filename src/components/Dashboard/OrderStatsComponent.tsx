import React, { FC, useEffect, useState } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer
} from 'recharts';
import { 
    ShoppingBag, Check, Clock, Truck, X, DollarSign
} from 'lucide-react';
import axios from 'axios';

interface OrderStatsProps {
    formatCurrency: (amount: number) => string;
    orderStats?: OrderStats;
}

interface OrderStats {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    processingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    dailyOrders: {
        date: string;
        count: number;
        revenue: number;
    }[];
}

const OrderStatsComponent: FC<OrderStatsProps> = ({ orderStats: propOrderStats, formatCurrency }) => {
    const [orderStats, setOrderStats] = useState<OrderStats | null>(propOrderStats || null);
    const [loading, setLoading] = useState(!propOrderStats);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

    // التأثير الأول: استخدام البيانات المُمررة أو جلب بيانات جديدة
    useEffect(() => {
        // إذا كانت البيانات مُمررة كـ prop، استخدمها
        if (propOrderStats) {
            setOrderStats(propOrderStats);
            setLoading(false);
            return;
        }
        
        const fetchOrderStats = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // تحديد نطاق التاريخ
                const today = new Date();
                let startDate: Date | null = null;
                
                if (dateRange === 'week') {
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 7);
                } else if (dateRange === 'month') {
                    startDate = new Date(today);
                    startDate.setMonth(today.getMonth() - 1);
                } else if (dateRange === 'year') {
                    startDate = new Date(today);
                    startDate.setFullYear(today.getFullYear() - 1);
                }
                
                // طلب البيانات من الخادم
                const response = await axios.get('/api/Orders/statistics', {
                    params: {
                        startDate: startDate?.toISOString(),
                        endDate: today.toISOString()
                    }
                });
                
                console.log('Order statistics response:', response.data);
                
                // التحقق من تنسيق البيانات
                if (response.data && 
                    typeof response.data.totalOrders === 'number' && 
                    Array.isArray(response.data.dailyOrders)) {
                    
                    // تنسيق البيانات للتأكد من صحة الأنواع
                    const formattedData: OrderStats = {
                        totalOrders: Number(response.data.totalOrders) || 0,
                        completedOrders: Number(response.data.completedOrders) || 0,
                        pendingOrders: Number(response.data.pendingOrders) || 0,
                        processingOrders: Number(response.data.processingOrders) || 0,
                        cancelledOrders: Number(response.data.cancelledOrders) || 0,
                        totalRevenue: Number(response.data.totalRevenue) || 0,
                        averageOrderValue: Number(response.data.averageOrderValue) || 0,
                        dailyOrders: response.data.dailyOrders.map((day: any) => ({
                            date: day.date,
                            count: Number(day.count) || 0,
                            revenue: Number(day.revenue) || 0
                        }))
                    };
                    
                    setOrderStats(formattedData);
                } else {
                    console.error('تنسيق بيانات إحصائيات الطلبات غير صحيح:', response.data);
                    setError('فشل في جلب إحصائيات الطلبات بالتنسيق الصحيح');
                }
            } catch (err) {
                console.error('خطأ في جلب إحصائيات الطلبات:', err);
                setError('فشل في جلب إحصائيات الطلبات');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderStats();
    }, [propOrderStats, dateRange]);

    // تصفية البيانات حسب نطاق التاريخ إذا كانت البيانات مُمررة
    useEffect(() => {
        if (!propOrderStats || !orderStats) return;
        
        // تطبيق تصفية نطاق التاريخ على البيانات الممررة
        // هذا يعمل فقط إذا كانت البيانات تحتوي على تواريخ كافية لتغطية النطاق المطلوب
        try {
            // في حالة واقعية، قد تحتاج لمنطق أكثر تعقيدًا لتصفية الطلبات حسب التاريخ
            console.log('تطبيق نطاق التاريخ على البيانات المُمررة:', dateRange);
        } catch (err) {
            console.error('خطأ في تصفية البيانات حسب نطاق التاريخ:', err);
        }
    }, [dateRange, propOrderStats, orderStats]);

    // تحويل البيانات إلى تنسيق مناسب للرسم البياني
    const dailyOrdersData = orderStats?.dailyOrders.map(order => ({
        date: order.date,
        طلبات: order.count,
        إيرادات: order.revenue
    })) || [];

    // التعامل مع تغيير نطاق التاريخ
    const handleDateRangeChange = (range: 'week' | 'month' | 'year') => {
        setDateRange(range);
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">إحصائيات الطلبات</h2>
            
            {/* أزرار نطاق التاريخ */}
            <div className="mb-4 flex space-x-2 space-x-reverse justify-end">
                <button 
                key="week"
                    onClick={() => handleDateRangeChange('week')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${dateRange === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    آخر أسبوع
                </button>
                <button 
                key="month"
                    onClick={() => handleDateRangeChange('month')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${dateRange === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    آخر شهر
                </button>
                <button 
                     key="year"
                    onClick={() => handleDateRangeChange('year')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${dateRange === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    آخر سنة
                </button>
            </div>
            
            {loading ? (
                <div className="text-center p-6">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>جاري تحميل البيانات...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            ) : orderStats ? (
                <>
                    {/* إحصائيات الطلبات */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        {/* إجمالي الطلبات */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                                    <h3 className="text-xl font-bold">{orderStats.totalOrders}</h3>
                                </div>
                            </div>
                        </div>

                        {/* الطلبات المكتملة */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm text-gray-500">الطلبات المكتملة</p>
                                    <h3 className="text-xl font-bold">{orderStats.completedOrders}</h3>
                                    <p className="text-xs text-gray-500">
                                        {orderStats.totalOrders > 0 
                                        ? `${((orderStats.completedOrders / orderStats.totalOrders) * 100).toFixed(1)}%` 
                                        : '0%'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* الطلبات قيد الانتظار */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-3 rounded-full">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm text-gray-500">طلبات قيد الانتظار</p>
                                    <h3 className="text-xl font-bold">{orderStats.pendingOrders}</h3>
                                    <p className="text-xs text-gray-500">
                                        {orderStats.totalOrders > 0 
                                        ? `${((orderStats.pendingOrders / orderStats.totalOrders) * 100).toFixed(1)}%` 
                                        : '0%'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* الطلبات قيد المعالجة */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <Truck className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm text-gray-500">قيد المعالجة</p>
                                    <h3 className="text-xl font-bold">{orderStats.processingOrders}</h3>
                                    <p className="text-xs text-gray-500">
                                        {orderStats.totalOrders > 0 
                                        ? `${((orderStats.processingOrders / orderStats.totalOrders) * 100).toFixed(1)}%` 
                                        : '0%'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* الطلبات الملغاة */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <X className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm text-gray-500">الطلبات الملغاة</p>
                                    <h3 className="text-xl font-bold">{orderStats.cancelledOrders}</h3>
                                    <p className="text-xs text-gray-500">
                                        {orderStats.totalOrders > 0 
                                        ? `${((orderStats.cancelledOrders / orderStats.totalOrders) * 100).toFixed(1)}%` 
                                        : '0%'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* معلومات إضافية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* إجمالي الإيرادات */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
                                    <h3 className="text-2xl font-bold text-green-600">
                                        {formatCurrency(orderStats.totalRevenue)}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* متوسط قيمة الطلب */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm text-gray-500">متوسط قيمة الطلب</p>
                                    <h3 className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(orderStats.averageOrderValue)}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* رسم بياني الطلبات اليومية */}
                    {dailyOrdersData.length > 0 ? (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold text-purple-600">الطلبات اليومية</h2>
                            </div>
                            <div className="p-6">
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dailyOrdersData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis yAxisId="left" orientation="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip formatter={(value, name) => {
                                                if (name === 'طلبات') {
                                                    return [`${value} طلب`, name];
                                                }
                                                return [formatCurrency(Number(value)), name];
                                            }} />
                                            <Line 
                                                yAxisId="left"
                                                type="monotone" 
                                                dataKey="طلبات" 
                                                stroke="#9333ea" 
                                                strokeWidth={2} 
                                                activeDot={{ r: 8 }}
                                            />
                                            <Line 
                                                yAxisId="right"
                                                type="monotone" 
                                                dataKey="إيرادات" 
                                                stroke="#0ea5e9" 
                                                strokeWidth={2} 
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-500">لا توجد بيانات طلبات يومية متاحة للعرض</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <p>لا توجد بيانات متاحة</p>
                </div>
            )}

            {/* جدول بيانات الطلبات */}
            {orderStats && orderStats.dailyOrders.length > 0 && (
                <div className="bg-white rounded-lg shadow mt-8">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-purple-600">تفاصيل الطلبات اليومية</h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">عدد الطلبات</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">الإيرادات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orderStats.dailyOrders.map((day, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 font-medium text-gray-900">{day.date}</td>
                                            <td className="px-4 py-2 text-gray-500">{day.count} طلب</td>
                                            <td className="px-4 py-2 text-gray-500">{formatCurrency(day.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-medium">
                                    <tr>
                                        <td className="px-4 py-2 text-gray-900">الإجمالي</td>
                                        <td className="px-4 py-2 text-gray-900">{orderStats.totalOrders} طلب</td>
                                        <td className="px-4 py-2 text-gray-900">{formatCurrency(orderStats.totalRevenue)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderStatsComponent;