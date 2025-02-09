import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { 
    Product as DashboardProduct,
    Customer, 
    TopProduct, 
    SalesData, 
    DashboardCalculations, 
    ProfitCalculations,
    StockStatus
} from '../types/dashboard';
import { Product as ProductType } from '../types/product';

interface DailyOrder {
  date: string;
  count: number;
  revenue: number;
}

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  processingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  dailyOrders: DailyOrder[];
}

interface SaleAnalytic {
  date: string;
  sales: number;
  revenue: number;
  subTotal: number;
  vat: number;
  deliveryFees: number;
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
                      activeCustomers: 0
                  });
              } catch (error) {
                  console.error('Error fetching product data:', error);
              }

              try {
                  const [salesAnalytics, orderStatistics, topSellingProducts, topCustomersData] = 
                      await Promise.all([
                          productService.getSalesAnalytics(),
                          orderService.getOrdersStatistics(),
                          productService.getTopSellingProducts(),
                          orderService.getTopCustomers()
                      ]);

                  if (salesAnalytics) {
                      const formattedSalesData = (salesAnalytics as SaleAnalytic[]).map((sale: SaleAnalytic) => ({
                          name: new Date(sale.date).toLocaleDateString('ar-SA'),
                          sales: sale.sales,
                          revenue: sale.revenue,
                          subTotal: sale.subTotal,
                          vat: sale.vat,
                          deliveryFees: sale.deliveryFees
                      }));
                      setSalesData(formattedSalesData);
                  }

                  // نحول OrderStats إلى النوع الصحيح
                  const typedOrderStats: OrderStats = {
                      ...orderStatistics,
                      dailyOrders: orderStatistics.dailyOrders.map((order: DailyOrder) => ({
                          date: order.date,
                          count: order.count,
                          revenue: order.revenue
                      }))
                  };
                  setOrderStats(typedOrderStats);
                  
                  setTopProducts(topSellingProducts);
                  setTopCustomers(topCustomersData);

                  setProfitCalculations({
                      totalProfit: orderStatistics.totalRevenue,
                      netProfit: orderStatistics.totalRevenue * 0.7,
                      grossMargin: 30,
                      profitMargin: 21
                  });

                  setCalculations(prev => ({
                      ...prev,
                      activeCustomers: orderStatistics.completedOrders
                  }));

              } catch (error) {
                  console.error('Error fetching sales and order data:', error);
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