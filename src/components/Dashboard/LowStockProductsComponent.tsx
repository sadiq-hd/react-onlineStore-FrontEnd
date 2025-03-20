import React, { FC, useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { AlertTriangle, Package } from 'lucide-react';
import { productService } from '../../services/productService';

interface LowStockProductsProps {
    formatCurrency: (amount: number) => string;
}

// تعريف نموذج المنتج منخفض المخزون
interface LowStockProduct {
    id: number;
    name: string;
    stock: number;
    category: string;
    price?: number;
}

interface CategoryStat {
    name: string;
    count: number;
    outOfStock: number;
    lowStock: number;
}

const LowStockProductsComponent: FC<LowStockProductsProps> = ({ formatCurrency }) => {
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
    const [outOfStockProducts, setOutOfStockProducts] = useState<LowStockProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

    useEffect(() => {
        const fetchLowStockProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // استخدام productService بدلاً من axios مباشرة
                const products = await productService.getLowStockProducts(10);
                console.log('Low stock products:', products);
                
                // تقسيم المنتجات إلى منتهية المخزون ومنخفضة المخزون
                if (Array.isArray(products)) {
                    const outOfStock = products.filter(p => p.stock === 0);
                    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10);
                    
                    setOutOfStockProducts(outOfStock);
                    setLowStockProducts(lowStock);
                    
                    // حساب إحصائيات الفئات
                    const categories: Record<string, CategoryStat> = {};
                    
                    for (const product of products) {
                        const category = product.category || 'غير مصنف';
                        if (!categories[category]) {
                            categories[category] = {
                                name: category,
                                count: 0,
                                outOfStock: 0,
                                lowStock: 0
                            };
                        }
                        
                        categories[category].count += 1;
                        
                        if (product.stock === 0) {
                            categories[category].outOfStock += 1;
                        } else {
                            categories[category].lowStock += 1;
                        }
                    }
                    
                    setCategoryStats(Object.values(categories));
                } else {
                    console.error('Invalid products data format:', products);
                    setError('تنسيق بيانات المنتجات غير صالح');
                    setOutOfStockProducts([]);
                    setLowStockProducts([]);
                    setCategoryStats([]);
                }
            } catch (err) {
                console.error('Error fetching low stock products:', err);
                setError('فشل في جلب بيانات المنتجات منخفضة المخزون');
                setOutOfStockProducts([]);
                setLowStockProducts([]);
                setCategoryStats([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLowStockProducts();
    }, []);

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">حالة المخزون</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* إجمالي المنتجات منخفضة المخزون */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">منتجات منخفضة المخزون</p>
                            <h3 className="text-xl font-bold">
                                {Array.isArray(lowStockProducts) ? lowStockProducts.length : 0}
                            </h3>
                            <p className="text-xs text-gray-500">
                                المخزون أقل من 10 وحدات
                            </p>
                        </div>
                    </div>
                </div>

                {/* المنتجات التي نفذت من المخزون */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-full">
                            <Package className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">منتجات نفذت من المخزون</p>
                            <h3 className="text-xl font-bold text-red-600">
                                {Array.isArray(outOfStockProducts) ? outOfStockProducts.length : 0}
                            </h3>
                            <p className="text-xs text-gray-500">
                                يجب إعادة تعبئة المخزون عاجلاً
                            </p>
                        </div>
                    </div>
                </div>

                {/* نسبة التغطية */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">إجمالي المنتجات التي تحتاج للتعبئة</p>
                            <h3 className="text-xl font-bold">
                                {(Array.isArray(lowStockProducts) ? lowStockProducts.length : 0) + 
                                 (Array.isArray(outOfStockProducts) ? outOfStockProducts.length : 0)}
                            </h3>
                            <p className="text-xs text-gray-500">
                                من أصل كل المنتجات
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* توزيع المنتجات منخفضة المخزون حسب الفئة */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-purple-600">توزيع المنتجات منخفضة المخزون حسب الفئة</h2>
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
                            ) : categoryStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="outOfStock" fill="#EF4444" name="نفذ المخزون" />
                                        <Bar dataKey="lowStock" fill="#F59E0B" name="منخفض المخزون" />
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

                {/* قائمة المنتجات التي نفذت من المخزون */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-red-600">المنتجات التي نفذت من المخزون</h2>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <p>جاري تحميل البيانات...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : outOfStockProducts.length > 0 ? (
                            <div className="overflow-x-auto max-h-80 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">المنتج</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">الفئة</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">المخزون</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {outOfStockProducts.map((product) => (
                                            <tr key={product.id} className="bg-red-50">
                                                <td className="px-4 py-2 font-medium text-gray-900">{product.name}</td>
                                                <td className="px-4 py-2 text-gray-500">{product.category}</td>
                                                <td className="px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                                        نفذ المخزون
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center p-4">لا توجد منتجات نفذت من المخزون</p>
                        )}
                    </div>
                </div>
            </div>

            {/* قائمة المنتجات منخفضة المخزون */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-yellow-600">المنتجات منخفضة المخزون</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <p>جاري تحميل البيانات...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : lowStockProducts.length > 0 ? (
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">المنتج</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">الفئة</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">المخزون</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {lowStockProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-2 font-medium text-gray-900">{product.name}</td>
                                            <td className="px-4 py-2 text-gray-500">{product.category}</td>
                                            <td className="px-4 py-2 text-gray-500">{product.stock}</td>
                                            <td className="px-4 py-2">
                                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                                    منخفض
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center p-4">لا توجد منتجات منخفضة المخزون</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LowStockProductsComponent;