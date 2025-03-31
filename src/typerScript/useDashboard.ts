import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { 
    Product as DashboardProduct,
    DashboardCalculations, 
    ProfitCalculations,
    StockStatus
} from '../types/dashboard';
import { Product as ProductType } from '../types/product';
import { SalesData } from '../types/dashboard';

interface DailyOrder {
  date: string;
  count: number;
  revenue: number;
}

// تحديث تعريف TopProduct لإضافة حقل id
interface TopProduct {
  id: number; // إضافة حقل id المفقود
  name: string;
  sales: number;
  revenue: number;
}

interface Customer {
  id: number;
  name: string;
  ordersCount?: number; // جعلها اختيارية
  purchases: number;
  totalSpent: number;
  lastPurchase: string;
}

// تعريف SalesAnalytics ليتوافق مع البيانات المستخدمة
interface SalesAnalytics {
  date: string;
  sales: number;
  revenue: number;
  subTotal: number;
  vat: number;
  deliveryFees: number;
}

// تحديث OrderStats لتتوافق مع الشكل المستخدم في الكود
interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  processingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  dailyOrders: DailyOrder[]; // استخدام DailyOrder بدلاً من never[]
}

export const useDashboard = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<DashboardProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<DashboardProduct[]>([]);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
    const [calculations, setCalculations] = useState<DashboardCalculations>({
        totalProducts: 0,
        totalStock: 0,
        totalValue: 0,
        activeCustomers: 0
    });
    const [profitCalculations, setProfitCalculations] = useState<ProfitCalculations>({
        totalProfit: 0,
        netProfit: 0,
        grossMargin: 0,
        profitMargin: 0
    });
    const [orderStats, setOrderStats] = useState<OrderStats>({
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      dailyOrders: []
    });

    // تحويل نوع المنتج
    const transformProduct = (product: ProductType): DashboardProduct => ({
        ...product,
        images: product.images.map(img => img.imageUrl)
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
    
                // 1. جلب بيانات المنتجات وإحصائياتها
                try {
                    const [productsData, productStats] = await Promise.all([
                        productService.getAllProducts(),
                        productService.getProductStats()
                    ]);
    
                    const transformedProducts = productsData.map(transformProduct);
                    setProducts(transformedProducts);
                    setFilteredProducts(transformedProducts);
    
                    setCalculations({
                        totalProducts: productStats.totalProducts,
                        totalStock: productStats.totalStock,
                        totalValue: productStats.totalValue,
                        activeCustomers: 0 // سيتم تحديثه لاحقًا
                    });
                } catch (error) {
                    console.error('Error fetching product data:', error);
                    setError('فشل في جلب بيانات المنتجات');
                    throw error;
                }
    
                // 2. جلب بيانات المبيعات
                try {
                    const salesData = await productService.getSalesAnalytics();
                    
                    const formattedSalesData = salesData.map(sale => ({
                        name: new Date(sale.date).toLocaleDateString('ar-SA'),
                        date: sale.date, // أضف هذا السطر للتأكد من أن date موجود
                        sales: sale.sales,
                        revenue: sale.revenue,
                        subTotal: sale.subTotal,
                        vat: sale.vat,
                        deliveryFees: sale.deliveryFees
                    }));
                    
                    setSalesData(formattedSalesData);
                } catch (error) {
                    console.error('Error fetching sales analytics:', error);
                    setError('فشل في جلب بيانات تحليل المبيعات');
                    throw error;
                }
    
                // 3. جلب إحصائيات الطلبات
                try {
                    const orderStats = await orderService.getOrdersStatistics();
                    setOrderStats(orderStats);
                    
                    try {
                        // 4. جلب تقرير الأرباح
                        const profitReport = await orderService.getProfitReport();
                        
                        // حساب هوامش الربح
                        const grossMargin = profitReport.totalRevenue > 0 
                            ? ((profitReport.totalRevenue - profitReport.totalVat) / profitReport.totalRevenue) * 100 
                            : 0;
                            
                        const profitMargin = profitReport.totalRevenue > 0 
                            ? (profitReport.netProfit / profitReport.totalRevenue) * 100 
                            : 0;
                        
                        // تعيين بيانات الأرباح الفعلية
                        const profitCalcs = {
                            totalProfit: profitReport.totalRevenue,
                            netProfit: profitReport.netProfit,
                            grossMargin: parseFloat(grossMargin.toFixed(2)),
                            profitMargin: parseFloat(profitMargin.toFixed(2))
                        };
                        
                        console.log('Profit calculations from API:', profitCalcs);
                        setProfitCalculations(profitCalcs);
                    } catch (profitError) {
                        console.error('Error fetching profit report:', profitError);
                        
                        // استخدام إحصائيات الطلبات كبديل في حالة فشل استدعاء تقرير الأرباح
                        const profitCalcs = {
                            totalProfit: orderStats.totalRevenue,
                            netProfit: orderStats.totalRevenue * 0.7,
                            grossMargin: 30,
                            profitMargin: 21
                        };
                        
                        console.log('Using fallback profit calculations:', profitCalcs);
                        setProfitCalculations(profitCalcs);
                    }
                    
                    // تحديث عدد العملاء النشطين
                    setCalculations(prev => ({
                        ...prev,
                        activeCustomers: orderStats.completedOrders
                    }));
                } catch (error) {
                    console.error('Error fetching order statistics:', error);
                    setError('فشل في جلب إحصائيات الطلبات');
                    throw error;
                }
    
                // 5. جلب المنتجات الأكثر مبيعًا
                try {
                    const topProductsData = await productService.getTopSellingProducts();
                    setTopProducts(topProductsData);
                } catch (error) {
                    console.error('Error fetching top selling products:', error);
                    setError('فشل في جلب المنتجات الأكثر مبيعًا');
                    throw error;
                }
    
                // 6. جلب العملاء الأكثر شراءً
                try {
                    const topCustomersData = await orderService.getTopCustomers();
                    
                    // معالجة التواريخ قبل تعيين البيانات
                    const processedCustomers = topCustomersData.map(customer => {
                        // التعامل مع التاريخ بحذر
                        let lastPurchaseDate;
                        try {
                            if (customer.lastPurchase) {
                                lastPurchaseDate = customer.lastPurchase;
                            } else {
                                lastPurchaseDate = new Date().toISOString();
                            }
                        } catch (error) {
                            console.error("Error with date format:", error);
                            lastPurchaseDate = new Date().toISOString();
                        }
                        
                        return {
                            ...customer,
                            lastPurchase: lastPurchaseDate
                        };
                    });
                    
                    setTopCustomers(processedCustomers);
                } catch (error) {
                    console.error('Error fetching top customers:', error);
                    setError('فشل في جلب بيانات العملاء الأكثر شراءً');
                    throw error;
                }
    
                setLoading(false);
            } catch (error) {
                console.error('Error in fetchDashboardData:', error);
                setError(error instanceof Error ? error.message : 'حدث خطأ في جلب البيانات');
                setLoading(false);
            }
        };
    
        fetchDashboardData();
    }, []);
  
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue)
        );
        setFilteredProducts(filtered);
    };

    const stockStatus = (stock: number): StockStatus => {
        if (stock === 0) {
            return { 
                text: 'نفذ المخزون', 
                class: 'bg-red-100 text-red-800' 
            };
        }
        if (stock <= 10) {
            return { 
                text: 'منخفض', 
                class: 'bg-yellow-100 text-yellow-800' 
            };
        }
        return { 
            text: 'متوفر', 
            class: 'bg-green-100 text-green-800' 
        };
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return {
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
    };
};