import { FC } from 'react';
import { useDashboard } from '../typerScript/useDashboard';
import { Loader2 } from 'lucide-react';

// استيراد المكونات الجديدة
import OrderStatsComponent from '../components/Dashboard/OrderStatsComponent';
import SalesAnalyticsComponent from '../components/Dashboard/SalesAnalyticsComponent';
import ProfitAnalysisComponent from '../components/Dashboard/ProfitAnalysisComponent';
import LowStockProductsComponent from '../components/Dashboard/LowStockProductsComponent';
import DiscountsComponent from '../components/Dashboard/DiscountsComponent';
import ErrorBoundary from '../components/ErrorBoundary';
import { SalesData } from '../types/dashboard';
const AdminDashboard: FC = () => {
    const {
        searchTerm,
        handleSearch,
        filteredProducts,
        calculations,
        stockStatus,
        topCustomers,
        topProducts,
        salesData,
        profitCalculations,
        orderStats,
        loading,
        error,
        formatCurrency
    } = useDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="mr-2 text-lg text-gray-600">جاري تحميل البيانات...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-6 bg-red-100 text-red-700 rounded-lg max-w-xl text-center">
                    <h2 className="text-2xl font-bold mb-4">حدث خطأ</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const handleComponentError = (error: Error, componentName: string) => {
        console.error(`خطأ في مكون ${componentName}:`, error);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            <h1 className="text-3xl font-bold mb-8 text-purple-600">لوحة التحكم</h1>
            
            {/* بطاقات الإحصائيات السريعة */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-8 w-8 text-purple-600"
                            >
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">إجمالي المنتجات</p>
                            <h3 className="text-2xl font-bold">{calculations.totalProducts}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-8 w-8 text-purple-600"
                            >
                                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                                <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                            </svg>
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">المخزون</p>
                            <h3 className="text-2xl font-bold">{calculations.totalStock}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-8 w-8 text-purple-600"
                            >
                                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fontWeight="bold">
                                    ﷼
                                </text>
                            </svg>
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">قيمة المخزون</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(calculations.totalValue)}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-8 w-8 text-purple-600"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="mr-4">
                            <p className="text-sm text-gray-500">العملاء النشطين</p>
                            <h3 className="text-2xl font-bold">{calculations.activeCustomers}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* المكونات الجديدة محاطة بـ ErrorBoundary */}
            
          {/* مكون إحصائيات الطلبات */}
{orderStats && (
    <ErrorBoundary key="order-stats" onError={(error) => handleComponentError(error, 'OrderStatsComponent')}>
        <OrderStatsComponent 
            orderStats={orderStats} 
            formatCurrency={formatCurrency} 
        />
    </ErrorBoundary>
)}

{/* مكون تحليل المبيعات */}
{salesData && salesData.length > 0 && salesData.some(item => item.revenue > 0) && (
    <ErrorBoundary key="sales-analytics" onError={(error) => handleComponentError(error, 'SalesAnalyticsComponent')}>
        <SalesAnalyticsComponent 
            salesData={salesData} 
            formatCurrency={formatCurrency} 
        />
    </ErrorBoundary>
)}

     {/* مكون تحليل الأرباح */}
{profitCalculations && (
    <ErrorBoundary key="profit-analysis" onError={(error) => handleComponentError(error, 'ProfitAnalysisComponent')}>
        <ProfitAnalysisComponent 
            profitCalculations={profitCalculations} 
            formatCurrency={formatCurrency} 
        />
    </ErrorBoundary>
)}

{/* مكون إدارة الخصومات */}
<ErrorBoundary key="discounts" onError={(error) => handleComponentError(error, 'DiscountsComponent')}>
    <DiscountsComponent formatCurrency={formatCurrency} />
</ErrorBoundary>

{/* مكون المنتجات منخفضة المخزون */}
<ErrorBoundary key="low-stock" onError={(error) => handleComponentError(error, 'LowStockProductsComponent')}>
    <LowStockProductsComponent formatCurrency={formatCurrency} />
</ErrorBoundary>
            {/* جدول العملاء الأكثر شراءً */}
            <ErrorBoundary key="top-customers" onError={(error) => handleComponentError(error, 'TopCustomersTable')}>
            <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-purple-600">العملاء الأكثر شراءً</h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr key="data">
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">اسم العميل</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">عدد المشتريات</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">إجمالي الإنفاق</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">آخر عملية شراء</th>
                                    </tr>
                                </thead>
                                < tbody className="divide-y divide-gray-200">
                                    {topCustomers && topCustomers.length > 0 ? (
                                        topCustomers.map((customer) => (
                                            <tr key={customer.id}>
    <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
    <td className="px-6 py-4 text-gray-500">{customer.ordersCount}</td>
    <td className="px-6 py-4 text-gray-500">
        {formatCurrency(customer.totalSpent)}
    </td>
    <td className="px-6 py-4 text-gray-500">
  {(() => {
    // استخدام أي من الحقول المتاحة باستخدام واجهة Customer
    const dateString = customer.lastOrder || customer.lastPurchase;
    
    if (!dateString) return '-';
    
    try {
      // التحقق إذا كان التاريخ بتنسيق هجري
      if (typeof dateString === 'string' && dateString.includes('هـ')) {
        return dateString;
      }
      
      // محاولة تحويل التاريخ
      const date = new Date(dateString);
      
      // التحقق من صحة التاريخ
      return !isNaN(date.getTime()) 
        ? date.toLocaleDateString('ar-SA')
        : '-';
    } catch (error) {
      console.error("خطأ في تنسيق التاريخ:", error);
      return '-';
    }
  })()}
</td>
</tr>
                                        ))
                                    ) : (
                                         <tr key="no-data">
                                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                لا توجد بيانات للعرض
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>

            {/* المنتجات الأكثر مبيعًا */}
            <ErrorBoundary key="top-products" onError={(error) => handleComponentError(error, 'TopProductsTable')}>
            <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-purple-600">المنتجات الأكثر مبيعًا</h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr key="test">
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المنتج</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">عدد المبيعات</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الإيرادات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {topProducts && topProducts.length > 0 ? (
                                        topProducts.map((product, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                                <td className="px-6 py-4 text-gray-500">{product.sales}</td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {formatCurrency(product.revenue)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr key="test-2">
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                                لا توجد بيانات للعرض
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>

            {/* جدول المنتجات */}
            <ErrorBoundary key="products-table" onError={(error) => handleComponentError(error, 'ProductsTable')}>
            <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-purple-600">المنتجات</h2>
                        <div className="relative w-64">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute right-3 top-3 h-4 w-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="بحث عن منتج..."
                                className="w-full pr-10 py-2 px-4 border rounded-lg focus:outline-none focus:border-purple-500"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr key="list">
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المنتج</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الفئة</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">السعر</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المخزون</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts && filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {product.images && product.images.length > 0 && (
                                                            <img 
                                                                src={product.images[0]} 
                                                                alt={product.name}
                                                                className="w-10 h-10 rounded-full object-cover ml-2"
                                                            />
                                                        )}
                                                        <span className="font-medium text-gray-900">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{product.category}</td>
                                                <td className="px-6 py-4 text-gray-500">{formatCurrency(product.price)}</td>
                                                <td className="px-6 py-4 text-gray-500">{product.stock}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${stockStatus(product.stock).class}`}>
                                                        {stockStatus(product.stock).text}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr key="no-products">
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                                لا توجد منتجات للعرض
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    );
};

export default AdminDashboard;