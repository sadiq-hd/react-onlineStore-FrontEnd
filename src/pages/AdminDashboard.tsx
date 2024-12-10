import { type FC } from 'react';
import { useDashboard } from '../typerScript/useDashboard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  Search, Package, Users, Archive 
} from 'lucide-react';

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
    profitCalculations

  } = useDashboard();
  console.log('Dashboard Data:', {
    filteredProducts,
    topCustomers,
    topProducts,
    salesData
  });
  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-purple-600">لوحة التحكم</h1>
      
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="h-8 w-8 text-purple-600" />
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
              <Archive className="h-8 w-8 text-purple-600" />
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
      <h3 className="text-2xl font-bold">
        {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(calculations.totalValue)}
      </h3>
    </div>
  </div>
</div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">العملاء النشطين</p>
              <h3 className="text-2xl font-bold">{calculations.activeCustomers}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* مخطط المبيعات */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-purple-600">تحليل المبيعات</h2>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#9333ea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* المنتجات الأكثر مبيعاً */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-purple-600">المنتجات الأكثر مبيعاً</h2>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#9333ea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

       {/* الربح الإجمالي */}
       <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-green-600"
              >
                <path d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">الربح الإجمالي</p>
              <h3 className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('ar-SA', { 
                  style: 'currency', 
                  currency: 'SAR' 
                }).format(profitCalculations.totalProfit)}
              </h3>
            </div>
          </div>
        </div>

        {/* الربح الصافي */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-green-600"
              >
                <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">الربح الصافي</p>
              <h3 className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('ar-SA', { 
                  style: 'currency', 
                  currency: 'SAR' 
                }).format(profitCalculations.netProfit)}
              </h3>
            </div>
          </div>
        </div>


      {/* العملاء الأكثر شراءً */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-purple-600">العملاء الأكثر شراءً</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">اسم العميل</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">عدد المشتريات</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">إجمالي الإنفاق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 text-gray-500">{customer.purchases}</td>
                    <td className="px-6 py-4 text-gray-500">ر.س.{customer.totalSpent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-purple-600">المنتجات</h2>
          <div className="relative w-64">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
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
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المنتج</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الفئة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">السعر</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المخزون</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-10 h-10 rounded-full object-cover ml-2"
                        />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 text-gray-500">ر.س.{product.price}</td>
                    <td className="px-6 py-4 text-gray-500">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${stockStatus(product.stock).class}`}>
                        {stockStatus(product.stock).text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;