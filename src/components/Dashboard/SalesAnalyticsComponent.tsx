import React, { FC, useState, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, 
    PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';
import { SalesData } from '../../types/dashboard';
interface SalesAnalyticsProps {
    salesData?: SalesData[];

    formatCurrency: (amount: number) => string;
 

}



const SalesAnalyticsComponent: FC<SalesAnalyticsProps> = ({ salesData: propsSalesData, formatCurrency }) => {
    const [salesData, setSalesData] = useState<SalesData[]>(propsSalesData || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

    useEffect(() => {
        // إذا كانت البيانات متوفرة كخاصية، استخدمها
        if (propsSalesData && propsSalesData.length > 0) {
            setSalesData(propsSalesData);
            return;
        }
        
        // إذا لم تكن البيانات متوفرة، جلب البيانات من API
        const fetchSalesAnalytics = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get('/api/Products/sales-analytics', {
                    params: { period }
                });
                
                if (Array.isArray(response.data)) {
                    // نقوم بالتأكد من وجود البيانات وتنسيقها بشكل صحيح
                    const formattedData = response.data.map((item: any) => ({
                        name: new Date(item.date).toLocaleDateString('ar-SA'), // إضافة خاصية name
                        date: item.date,
                        sales: Number(item.sales) || 0,
                        revenue: Number(item.revenue) || 0,
                        subTotal: Number(item.subTotal) || 0,
                        vat: Number(item.vat) || 0,
                        deliveryFees: Number(item.deliveryFees) || 0
                    }));
                    
                    setSalesData(formattedData);
                } else {
                    console.error('تنسيق البيانات غير صحيح:', response.data);
                    setError('فشل في جلب بيانات المبيعات بالتنسيق الصحيح');
                    setSalesData([]);
                }
            } catch (err) {
                console.error('خطأ في جلب بيانات المبيعات:', err);
                setError('فشل في جلب بيانات المبيعات');
                setSalesData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesAnalytics();
    }, [period, propsSalesData]);

    // حساب إجماليات للرسم البياني الدائري
    const calculateTotals = () => {
        let totalSubTotal = 0;
        let totalVat = 0;
        let totalDeliveryFees = 0;

        salesData.forEach(item => {
            totalSubTotal += item.subTotal || 0;
            totalVat += item.vat || 0;
            totalDeliveryFees += item.deliveryFees || 0;
        });

        return [
            { name: 'المبيعات', value: totalSubTotal, color: '#8884d8' },
            { name: 'الضريبة', value: totalVat, color: '#82ca9d' },
            { name: 'رسوم التوصيل', value: totalDeliveryFees, color: '#ffc658' }
        ];
    };

    const pieData = calculateTotals();

    // تهيئة بيانات الرسم البياني المتعدد
    const stackedData = salesData.map(item => ({
        name: item.date,
        'صافي المبيعات': item.subTotal - (item.vat || 0),
        'الضريبة': item.vat || 0,
        'رسوم التوصيل': item.deliveryFees || 0
    }));

    // التعامل مع تغيير فترة التحليل
    const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month' | 'year') => {
        setPeriod(newPeriod);
    };

    // تنسيق تلميحات الرسم البياني
    const formatTooltipValue = (value: number, name: string) => {
        if (name === 'sales') {
            return [`${value} طلب`, 'عدد المبيعات'];
        }
        return [formatCurrency(value), name];
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">تحليل المبيعات المتقدم</h2>
            
            {/* أزرار الفلترة */}
            <div className="mb-4 flex space-x-2 space-x-reverse justify-end">
                <button 
                 key="day"

                    onClick={() => handlePeriodChange('day')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${period === 'day' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    يومي
                </button>
                <button 
                key="week"
                    onClick={() => handlePeriodChange('week')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${period === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    أسبوعي
                </button>
                <button 
                key="month"
                    onClick={() => handlePeriodChange('month')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${period === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    شهري
                </button>
                <button 
                key="year"
                    onClick={() => handlePeriodChange('year')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${period === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    سنوي
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* رسم بياني خطي للمبيعات والإيرادات */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-purple-600">تحليل المبيعات والإيرادات</h2>
                    </div>
                    <div className="p-6">
                        <div className="h-80">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <p>جاري تحميل البيانات...</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-500">{error}</p>
                                </div>
                            ) : salesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis yAxisId="left" orientation="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip 
    formatter={(value, name) => {
        if (name === 'sales' || name === 'عدد المبيعات') {
            return [`${value} طلب`, 'عدد المبيعات'];
        }
        return [formatCurrency(Number(value)), name === 'revenue' ? 'الإيرادات' : name];
    }}
/>
                                        <Legend />
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#9333ea" 
                                            strokeWidth={2} 
                                            name="الإيرادات"
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="sales" 
                                            stroke="#0ea5e9" 
                                            strokeWidth={2} 
                                            name="عدد المبيعات"
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p>لا توجد بيانات متاحة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* الرسم البياني الدائري لتوزيع الإيرادات */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-purple-600">توزيع الإيرادات</h2>
                    </div>
                    <div className="p-6">
                        <div className="h-80">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <p>جاري تحميل البيانات...</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-500">{error}</p>
                                </div>
                            ) : pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p>لا توجد بيانات متاحة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* الرسم البياني المتراكم للمبيعات والضرائب ورسوم التوصيل */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-purple-600">تفاصيل المبيعات</h2>
                </div>
                <div className="p-6">
                    <div className="h-80">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <p>جاري تحميل البيانات...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-red-500">{error}</p>
                            </div>
                        ) : stackedData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stackedData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                    <Bar dataKey="صافي المبيعات" stackId="a" fill="#8884d8" />
                                    <Bar dataKey="الضريبة" stackId="a" fill="#82ca9d" />
                                    <Bar dataKey="رسوم التوصيل" stackId="a" fill="#ffc658" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p>لا توجد بيانات متاحة</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ملخص الإحصائيات */}
            <div className="bg-white rounded-lg shadow mt-8">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-purple-600">ملخص الإحصائيات</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <p>جاري تحميل البيانات...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : salesData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">عدد المبيعات</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">الإيرادات</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">المجموع الفرعي</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">الضريبة</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">رسوم التوصيل</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {salesData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 font-medium text-gray-900">{item.date}</td>
                                            <td className="px-4 py-2 text-gray-500">{item.sales} طلب</td>
                                            <td className="px-4 py-2 text-gray-500">{formatCurrency(item.revenue)}</td>
                                            <td className="px-4 py-2 text-gray-500">{formatCurrency(item.subTotal)}</td>
                                            <td className="px-4 py-2 text-gray-500">{formatCurrency(item.vat)}</td>
                                            <td className="px-4 py-2 text-gray-500">{formatCurrency(item.deliveryFees)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center p-4">لا توجد بيانات متاحة</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesAnalyticsComponent;