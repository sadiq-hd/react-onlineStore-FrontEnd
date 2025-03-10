// src/services/productService.ts
import api, { API_CONFIG, formatImageUrl, handleApiError } from '../config/apiConfig';
import { 
  Product, 
  CreateProductDto, 
  SearchProductsParams, 
  ProductImage,
  ProductWithDiscountDto,
  ProductCategory,   
} from '../types/product';
import { CartItem } from '../typerScript/cart';

export interface ProductStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  productsByCategory: {
    category: string;
    count: number;
  }[];
}

export interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

export interface SalesAnalytics {
  date: string;
  sales: number;
  revenue: number;
  subTotal: number;
  vat: number;
  deliveryFees: number;
}

export interface DashboardStats {
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

export interface SalesStats {
  topSellingProducts: {
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }[];
  salesByPeriod: {
    date: string;
    sales: number;
    revenue: number;
  }[];
}

export const productService = {
  // جلب كل المنتجات
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products');
      console.log('Products response:', response.data);
      
      return response.data.map((product: Product) => ({
        ...product,
        images: product.images?.map((img: ProductImage) => ({
          ...img,
          imageUrl: formatImageUrl(img.imageUrl)
        })) || []
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw handleApiError(error);
    }
  },

  getProductStats: async (): Promise<ProductStats> => {
    try {
      const response = await api.get<ProductStats>('/products/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw handleApiError(error);
    }
  },

  // إحصائيات المبيعات
  getSalesStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SalesStats> => {
    try {
      const response = await api.get<SalesStats>('/products/sales-stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      throw handleApiError(error);
    }
  },

  async getTopSellingProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      const response = await api.get<TopProduct[]>('/Products/top-selling', {
        params: { limit }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      throw handleApiError(error);
    }
  },
  
  // في ملف productService.ts
  async getSalesAnalytics(period: string = 'month'): Promise<SalesAnalytics[]> {
    try {
      console.log("Fetching sales analytics for period:", period);
      
      const response = await api.get<SalesAnalytics[]>('/Products/sales-analytics', {
        params: { period }
      });
      
      console.log("Received sales analytics:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getSalesAnalytics:", error);
      throw handleApiError(error);
    }
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStats>('/products/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw handleApiError(error);
    }
  },

  // المنتجات منخفضة المخزون
  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products/low-stock', {
        params: { threshold }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw handleApiError(error);
    }
  },
  
  getCart: async (): Promise<CartItem[]> => {
    try {
      const response = await api.get<CartItem[]>('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw handleApiError(error);
    }
  },

  // إضافة منتج جديد  
  addProduct: async (productData: CreateProductDto): Promise<Product> => {
    try {
      const response = await api.post<Product>('/products', productData);
      console.log('Created product:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw handleApiError(error);    
    }
  },

  getProductsWithDiscounts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<ProductWithDiscountDto[]>('/products/with-discounts');
      console.log('Products with discounts response:', response.data);
      
      return response.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category as ProductCategory,
        images: Array.isArray(product.images) ? product.images.map((img: string | ProductImage) => {
          if (typeof img === 'string') {
            return {
              id: 0,
              productId: product.id,
              imageUrl: formatImageUrl(img)
            };
          } else {
            return {
              id: img.id || 0,
              productId: product.id,
              imageUrl: formatImageUrl(img.imageUrl)
            };
          }
        }) : [],
        hasDiscount: product.hasDiscount,
        discountedPrice: product.discountedPrice,
        discountName: product.discountName,
        discountValue: product.discountValue,
        discountType: product.discountType,
        createdAt: '',  // قيمة افتراضية
        updatedAt: '',  // قيمة افتراضية
      }));
    } catch (error) {
      console.error('Error fetching products with discounts:', error);
      throw handleApiError(error);
    }
  },
  
  // جلب منتج بواسطة المعرف
  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return {        
        ...response.data,
        images: response.data.images?.map(img => ({
          ...img,
          imageUrl: formatImageUrl(img.imageUrl)
        })) || []
      }; 
    } catch (error) {
      console.error('Error fetching product:', error);
      throw handleApiError(error);
    }
  },
  
  // تحديث منتج
  updateProduct: async (id: number, productData: CreateProductDto): Promise<Product> => {  
    try {
      const response = await api.put<Product>(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw handleApiError(error);
    }
  },

  // حذف منتج
  deleteProduct: async (id: number): Promise<void> => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw handleApiError(error);
    }
  },
  
  // إضافة صورة لمنتج
  addProductImage: async (id: number, imageFile: File): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await api.post<ProductImage>(
        `/products/${id}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return {
        ...response.data,
        imageUrl: formatImageUrl(response.data.imageUrl)
      };
    } catch (error) {
      console.error('Error adding product image:', error);
      throw handleApiError(error);
    }
  },
  
  addToCart: async (productId: number, quantity: number): Promise<string> => {
    try {
      const response = await api.post<string>('/cart/add', { productId, quantity });
      console.log('Product added to cart:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding product to cart:', error);
      throw handleApiError(error);
    }
  },
  
  // البحث عن المنتجات
  searchProducts: async (params: SearchProductsParams): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products/search', { params });
      
      return response.data.map(product => ({
        ...product,
        images: product.images?.map(img => ({
          ...img,
          imageUrl: formatImageUrl(img.imageUrl)
        })) || []
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw handleApiError(error);
    }
  }
};