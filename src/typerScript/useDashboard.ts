import { useState, ChangeEvent } from 'react';
import { Product, Customer, TopProduct, SalesData } from '../types/dashboard';

// البيانات التجريبية
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

const salesData: SalesData[] = [
  { name: 'يناير', sales: 4000 },
  { name: 'فبراير', sales: 3000 },
  { name: 'مارس', sales: 5000 },
  { name: 'أبريل', sales: 4500 },
  { name: 'مايو', sales: 6000 },
  { name: 'يونيو', sales: 5500 },
];

export const useDashboard = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const products = dummyProducts;

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter((product: Product) =>
    product.name.includes(searchTerm) || 
    product.category.includes(searchTerm)
  );

  const calculations = {
    totalStock: products.reduce((acc: number, curr: Product) => acc + curr.stock, 0),
    totalValue: products.reduce((acc: number, curr: Product) => acc + (curr.price * curr.stock), 0),
    totalProducts: products.length,
    activeCustomers: topCustomers.length
  };

  const stockStatus = (stock: number) => {
    if (stock > 10) return { class: 'bg-green-100 text-green-800', text: 'متوفر' };
    if (stock > 0) return { class: 'bg-yellow-100 text-yellow-800', text: 'منخفض' };
    return { class: 'bg-red-100 text-red-800', text: 'نفذ المخزون' };
  };

  return {
    searchTerm,
    handleSearch,
    filteredProducts,
    calculations,
    stockStatus,
    topCustomers,
    topProducts,
    salesData
  };
};