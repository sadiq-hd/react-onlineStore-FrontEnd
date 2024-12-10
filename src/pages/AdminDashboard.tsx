import { useState, type FC, ChangeEvent } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Search,
  Package,
  Users,
  DollarSign,
  Archive
} from 'lucide-react';

interface Product {
  id: number;
  category: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
}

interface Customer {
  id: number;
  name: string;
  purchases: number;
  totalSpent: number;
}

interface TopProduct {
  name: string;
  sales: number;
}

// بيانات تجريبية
export const dummyProducts: Product[] = [
    {
      id: 1,
      category: "سماعات",
      name: "سماعات لاسلكية",
      price: 299.99,
      stock: 3,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500"
      ],
      description: "سماعات بلوتوث عالية الجودة مع عزل للضوضاء"
    },
    {
      id: 2,
      category: "ساعات",
      name: "ساعة ذكية",
      price: 599.99,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500"
      ],
      description: "ساعة ذكية متعددة المزايا مع تتبع اللياقة البدنية"
    },
    {
      id: 3,
      category: "حقائب",
      name: "حقيبة لابتوب",
      price: 199.99,
      stock: 100,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500",
        "https://images.unsplash.com/photo-1576595580361-90a855b84b20?w=500"
      ],
      description: "حقيبة لابتوب أنيقة ومقاومة للماء"
    },
    {
      id: 4,
      category: "شواحن",
      name: "شاحن متنقل",
      price: 149.99,
      stock: 75,
      images: [
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
        "https://images.unsplash.com/photo-1585338647529-03d363fe9ace?w=500",
        "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500"
      ],
      description: "شاحن متنقل سعة 20000mAh مع شحن سريع"
    },
    {
      id: 5,
      category: "مستلزمات الكمبيوتر",
      name: "كيبورد ميكانيكي",
      price: 399.99,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500",
        "https://images.unsplash.com/photo-1595225476474-488a00f9c5b4?w=500"
      ],
      description: "لوحة مفاتيح ميكانيكية مع إضاءة RGB"
    },
    {
      id: 6,
      category: "مستلزمات الكمبيوتر",
      name: "ماوس للألعاب",
      price: 249.99,
      stock: 60,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500",
        "https://images.unsplash.com/photo-1588931731810-bcbe8624f1eb?w=500"
      ],
      description: "ماوس احترافي للألعاب مع دقة عالية"
    },
    {
      id: 7,
      category: "مستلزمات الكمبيوتر",

      name: "مكبر صوت بلوتوث",
      price: 179.99,
      stock: 0,
      images: [
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500",
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        "https://images.unsplash.com/photo-1612198273689-c47e28514ced?w=500"
      ],
      description: "سماعة بلوتوث محمولة مع صوت ستيريو قوي"
    }
  ];


const topCustomers: Customer[] = [
  { id: 1, name: "أحمد محمد", purchases: 15, totalSpent: 4500 },
  { id: 2, name: "سارة أحمد", purchases: 12, totalSpent: 3800 },
  { id: 3, name: "محمد علي", purchases: 10, totalSpent: 3200 },
  { id: 4, name: "فاطمة حسن", purchases: 8, totalSpent: 2900 },
];

const topProducts: TopProduct[] = [
  { name: "سماعات لاسلكية", sales: 150 },
  { name: "ساعة ذكية", sales: 120 },
  { name: "شاحن متنقل", sales: 100 },
  { name: "حقيبة لابتوب", sales: 80 }
];

const AdminDashboard: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // استخدام البيانات التجريبية مؤقتاً
  const products = dummyProducts;

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter((product: Product) =>
    product.name.includes(searchTerm) || 
    product.category.includes(searchTerm)
  );

  const totalStock = products.reduce((acc: number, curr: Product) => acc + curr.stock, 0);
  const totalValue = products.reduce((acc: number, curr: Product) => acc + (curr.price * curr.stock), 0);

  const salesData = [
    { name: 'يناير', sales: 4000 },
    { name: 'فبراير', sales: 3000 },
    { name: 'مارس', sales: 5000 },
    { name: 'أبريل', sales: 4500 },
    { name: 'مايو', sales: 6000 },
    { name: 'يونيو', sales: 5500 },
  ];


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
              <h3 className="text-2xl font-bold">{products.length}</h3>
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
              <h3 className="text-2xl font-bold">{totalStock}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">قيمة المخزون</p>
              <h3 className="text-2xl font-bold">ر.س.{totalValue.toFixed(2)}</h3>
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
              <h3 className="text-2xl font-bold">{topCustomers.length}</h3>
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
                      <span 
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stock > 10 
                          ? 'متوفر' 
                          : product.stock > 0 
                            ? 'منخفض' 
                            : 'نفذ المخزون'}
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