import React, { FC, useState, useEffect } from 'react';
import { 
    PieChart, Pie, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell, Bar, BarChart, Legend
} from 'recharts';
import axios from 'axios';
import { Tag, Clock, AlertTriangle } from 'lucide-react';
import { discountService } from '../../services/discountService';

interface DiscountsComponentProps {
    formatCurrency: (amount: number) => string;
}

// تعريف الأنماط المطلوبة هنا بدلاً من استيرادها
enum DiscountType {
    Percentage = 0,
    FixedAmount = 1
}

enum DiscountScope {
    AllProducts = 0,
    Category = 1,
    Product = 2
}

interface DiscountProduct {
    id?: number;
    discountId?: number;
    productId: number;
}

interface Discount {
    id: number;
    name: string;
    description: string;
    type: DiscountType;
    value: number;
    scope: DiscountScope;
    categoryName?: string;
    products?: DiscountProduct[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: Date;
}

// تعريف نموذج الإحصائيات
interface TypeStat {
    name: string;
    count: number;
}

interface ScopeStat {
    name: string;
    count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DiscountsComponent: FC<DiscountsComponentProps> = ({ formatCurrency }) => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
    const [expiredDiscounts, setExpiredDiscounts] = useState<Discount[]>([]);
    const [upcomingDiscounts, setUpcomingDiscounts] = useState<Discount[]>([]);
    const [typeStats, setTypeStats] = useState<TypeStat[]>([]);
    const [scopeStats, setScopeStats] = useState<ScopeStat[]>([]);

    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // استخدام discountService بدلاً من axios مباشرة
                const discountsData = await discountService.getAllDiscounts();
                console.log('Discounts data:', discountsData);
                
                if (Array.isArray(discountsData)) {
                    setDiscounts(discountsData);
                    
                    // تصنيف الخصومات حسب حالتها
                    const now = new Date();
                    const active: Discount[] = [];
                    const expired: Discount[] = [];
                    const upcoming: Discount[] = [];
                    
                    // إحصائيات حسب النوع والنطاق
                    const typeCount: Record<string, number> = {};
                    const scopeCount: Record<string, number> = {};
                    
                    for (const discount of discountsData) {
                        const startDate = new Date(discount.startDate);
                        const endDate = new Date(discount.endDate);
                        
                        // تصنيف حسب الحالة
                        if (!discount.isActive) {
                            expired.push(discount);
                        } else if (now < startDate) {
                            upcoming.push(discount);
                        } else if (now > endDate) {
                            expired.push(discount);
                        } else {
                            active.push(discount);
                        }
                        
                        // إحصائيات النوع
                        const typeText = getDiscountTypeText(discount.type);
                        typeCount[typeText] = (typeCount[typeText] || 0) + 1;
                        
                        // إحصائيات النطاق
                        const scopeText = getDiscountScopeText(discount);
                        scopeCount[scopeText] = (scopeCount[scopeText] || 0) + 1;
                    }
                    
                    setActiveDiscounts(active);
                    setExpiredDiscounts(expired);
                    setUpcomingDiscounts(upcoming);
                    
                    // تحويل إحصائيات النوع والنطاق إلى مصفوفات للرسوم البيانية
                    setTypeStats(Object.entries(typeCount).map(([name, count]) => ({ name, count })));
                    setScopeStats(Object.entries(scopeCount).map(([name, count]) => ({ name, count })));
                } else {
                    console.error('Invalid discount data format:', discountsData);
                    setError('تنسيق بيانات الخصومات غير صالح');
                    setDiscounts([]);
                    setActiveDiscounts([]);
                    setExpiredDiscounts([]);
                    setUpcomingDiscounts([]);
                    setTypeStats([]);
                    setScopeStats([]);
                }
            } catch (err) {
                console.error('Error fetching discounts:', err);
                setError('فشل في جلب بيانات الخصومات');
                setDiscounts([]);
                setActiveDiscounts([]);
                setExpiredDiscounts([]);
                setUpcomingDiscounts([]);
                setTypeStats([]);
                setScopeStats([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscounts();
    }, []);

    // تحويل نوع التخفيض إلى نص للعرض
    const getDiscountTypeText = (type: number | string | DiscountType | undefined): string => {
        if (type === undefined || type === null) {
            return 'غير محدد';
        }
        
        // التعامل مع القيم النصية
        if (typeof type === 'string') {
            if (type === 'Percentage') return 'نسبة مئوية';
            if (type === 'FixedAmount') return 'مبلغ ثابت';
            
            // محاولة تحويل النص إلى رقم
            const numericType = parseInt(type, 10);
            if (!isNaN(numericType)) {
                return numericType === DiscountType.Percentage ? 'نسبة مئوية' : 'مبلغ ثابت';
            }
            
            return `نوع: ${type}`;
        }
        
        // التعامل مع القيم الرقمية
        return type === DiscountType.Percentage ? 'نسبة مئوية' : 'مبلغ ثابت';
    };

    // تحويل نطاق التخفيض إلى نص للعرض
    const getDiscountScopeText = (discount: Discount): string => {
        const { scope, categoryName, products } = discount;
        
        if (scope === undefined || scope === null) {
            return 'غير محدد';
        }
        
        // التعامل مع القيم النصية
        if (typeof scope === 'string') {
            if (scope === 'AllProducts' || scope === 'Global') return 'جميع المنتجات';
            if (scope === 'Category') return `فئة: ${categoryName || 'غير محددة'}`;
            if (scope === 'Product') {
                const productCount = products?.length || 0;
                return `منتجات محددة (${productCount})`;
            }
            
            // محاولة تحويل النص إلى رقم
            const numericScope = parseInt(scope, 10);
            if (!isNaN(numericScope)) {
                if (numericScope === DiscountScope.AllProducts) return 'جميع المنتجات';
                if (numericScope === DiscountScope.Category) return `فئة: ${categoryName || 'غير محددة'}`;
                if (numericScope === DiscountScope.Product) {
                    const productCount = products?.length || 0;
                    return `منتجات محددة (${productCount})`;
                }
            }
            
            return `نطاق: ${scope}`;
        }
        
        // التعامل مع القيم الرقمية
        if (scope === DiscountScope.AllProducts) {
            return 'جميع المنتجات';
        } else if (scope === DiscountScope.Category) {
            return `فئة: ${categoryName || 'غير محددة'}`;
        } else if (scope === DiscountScope.Product) {
            const productCount = products?.length || 0;
            return `منتجات محددة (${productCount})`;
        }
        
        return `نطاق آخر (${scope})`;
    };

    // تحويل القيمة إلى نص مع الوحدة المناسبة
    const formatDiscountValue = (discount: Discount): string => {
        const normalizedType = typeof discount.type === 'string' 
            ? (discount.type === 'Percentage' ? DiscountType.Percentage : DiscountType.FixedAmount)
            : discount.type;
        
        return `${discount.value}${normalizedType === DiscountType.Percentage ? '%' : ' ريال'}`;
    };

    // حساب عدد أيام انتهاء الخصومات النشطة
    const getDaysUntilExpiration = (discount: Discount) => {
        const now = new Date();
        const endDate = new Date(discount.endDate);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // الخصومات التي ستنتهي قريباً
    const soonToExpireDiscounts = Array.isArray(activeDiscounts) 
        ? activeDiscounts
            .filter(discount => getDaysUntilExpiration(discount) <= 7)
            .sort((a, b) => getDaysUntilExpiration(a) - getDaysUntilExpiration(b))
        : [];

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">إدارة الخصومات</h2>
            
            {/* إحصائيات الخصومات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* الخصومات النشطة */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <Tag className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">الخصومات النشطة</p>
                            <h3 className="text-xl font-bold">{Array.isArray(activeDiscounts) ? activeDiscounts.length : 0}</h3>
                            <p className="text-xs text-gray-500">
                                حالياً
                            </p>
                        </div>
                    </div>
                </div>

                {/* الخصومات القادمة */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">الخصومات القادمة</p>
                            <h3 className="text-xl font-bold">{Array.isArray(upcomingDiscounts) ? upcomingDiscounts.length : 0}</h3>
                            <p className="text-xs text-gray-500">
                                لم تبدأ بعد
                            </p>
                        </div>
                    </div>
                </div>

                {/* الخصومات التي ستنتهي قريباً */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">خصومات تنتهي قريباً</p>
                            <h3 className="text-xl font-bold">{soonToExpireDiscounts.length}</h3>
                            <p className="text-xs text-gray-500">
                                خلال 7 أيام
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* توزيع الخصومات حسب النوع */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-purple-600">توزيع الخصومات حسب النوع</h2>
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
                            ) : typeStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={typeStats}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {typeStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
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

                {/* توزيع الخصومات حسب النطاق */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-purple-600">توزيع الخصومات حسب النطاق</h2>
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
                            ) : scopeStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={scopeStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8884d8" name="عدد الخصومات" />
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
            </div>

            {/* الخصومات التي ستنتهي قريباً */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-yellow-600">الخصومات التي ستنتهي قريباً</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <p>جاري تحميل البيانات...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : soonToExpireDiscounts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">اسم الخصم</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">القيمة</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">النطاق</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">تاريخ الانتهاء</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">الأيام المتبقية</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {soonToExpireDiscounts.map((discount) => {
                                        const daysLeft = getDaysUntilExpiration(discount);
                                        let statusClass = "bg-green-100 text-green-800";
                                        if (daysLeft <= 3) {
                                            statusClass = "bg-red-100 text-red-800";
                                        } else if (daysLeft <= 7) {
                                            statusClass = "bg-yellow-100 text-yellow-800";
                                        }
                                        
                                        return (
                                            <tr key={discount.id}>
                                                <td className="px-4 py-2 font-medium text-gray-900">{discount.name}</td>
                                                <td className="px-4 py-2 text-gray-500">{formatDiscountValue(discount)}</td>
                                                <td className="px-4 py-2 text-gray-500">
                                                    {getDiscountScopeText(discount)}
                                                </td>
                                                <td className="px-4 py-2 text-gray-500">{new Date(discount.endDate).toLocaleDateString('ar-SA')}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${daysLeft <= 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {daysLeft === 0 ? 'ينتهي اليوم' : `${daysLeft} يوم`}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center p-4">لا توجد خصومات تنتهي قريباً</p>
                    )}
                </div>
            </div>

            {/* قائمة الخصومات النشطة */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-purple-600">الخصومات النشطة</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <p>جاري تحميل البيانات...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : Array.isArray(activeDiscounts) && activeDiscounts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">اسم الخصم</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">القيمة</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">النطاق</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">تاريخ الانتهاء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {activeDiscounts.map((discount) => (
                                        <tr key={discount.id}>
                                            <td className="px-4 py-2 font-medium text-gray-900">{discount.name}</td>
                                            <td className="px-4 py-2 text-gray-500">{formatDiscountValue(discount)}</td>
                                            <td className="px-4 py-2 text-gray-500">
                                                {getDiscountScopeText(discount)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-500">{new Date(discount.endDate).toLocaleDateString('ar-SA')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center p-4">لا توجد خصومات نشطة</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiscountsComponent;