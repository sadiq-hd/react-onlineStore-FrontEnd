import axios from 'axios';
import { 
 Product, 
 CreateProductDto, 
 SearchProductsParams, 
 ProductImage,
 ProductWithDiscountDto ,
 ProductCategory,   
} from '../types/product';
import { CartItem } from '../typerScript/cart';
import api from '../config/axios';

const API_URL = 'https://localhost:5000/api';
const IMAGE_URL = 'https://localhost:5000';

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
     const response = await axios.get<Product[]>(`${API_URL}/products`);
     console.log('Products response:', response.data);
     
     return response.data.map((product: Product) => ({
       ...product,
       images: product.images?.map((img: ProductImage) => ({
           ...img,
           imageUrl: img.imageUrl.startsWith('/') 
               ? `${IMAGE_URL}${img.imageUrl}`
               : `${IMAGE_URL}/images/${img.imageUrl}`
       })) || []
     }));
   } catch (error) {
     console.error('Error fetching products:', error);
     throw error;
   }
 },

 getProductStats: async (): Promise<ProductStats> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get<ProductStats>(
      `${API_URL}/products/stats`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching product stats:', error);
    throw error;
  }
},

// إحصائيات المبيعات
getSalesStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SalesStats> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get<SalesStats>(
      `${API_URL}/products/sales-stats`,
      {
        params: { period },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    throw error;
  }
},



async getTopSellingProducts(limit: number = 5): Promise<TopProduct[]> {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get<TopProduct[]>(
      `${API_URL}/Products/top-selling`,
      {
        params: { limit },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    throw error;
  }
},
// في ملف productService.ts
async getSalesAnalytics(period: string = 'month'): Promise<SalesAnalytics[]> {
  const token = localStorage.getItem('token');
  try {
    console.log("Fetching sales analytics for period:", period);
    
    // تصحيح المسار ليتطابق مع الباك إند
    const response = await axios.get<SalesAnalytics[]>(`${API_URL}/Products/sales-analytics`, {
      params: { period },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log("Received sales analytics:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getSalesAnalytics:", error);
    throw error;
  }
},

getDashboardStats: async (): Promise<DashboardStats> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get<DashboardStats>(
      `${API_URL}/products/dashboard-stats`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
},



// المنتجات منخفضة المخزون
getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get<Product[]>(
      `${API_URL}/products/low-stock`,
      {
        params: { threshold },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
},
 
 getCart: async (): Promise<CartItem[]> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get<CartItem[]>(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
},

 // إضافة منتج جديد  
 addProduct: async (productData: CreateProductDto): Promise<Product> => {
   const token = localStorage.getItem('token');
   try {
     const response = await axios.post<Product>(`${API_URL}/products`, productData, {
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });
     console.log('Created product:', response.data);
     return response.data;
   } catch (error) {
     console.error('Error creating product:', error);
     throw error;    
   }
 },

 getProductsWithDiscounts: async (): Promise<Product[]> => {
  try {
    const response = await axios.get<ProductWithDiscountDto[]>(`${API_URL}/products/with-discounts`);
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
            imageUrl: img.startsWith('/') ? `${IMAGE_URL}${img}` : `${IMAGE_URL}/images/${img}`
          };
        } else {
          return {
            id: img.id || 0,
            productId: product.id,
            imageUrl: img.imageUrl.startsWith('/') ? `${IMAGE_URL}${img.imageUrl}` : `${IMAGE_URL}/images/${img.imageUrl}`
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
    throw error;
  }
},
 // جلب منتج بواسطة المعرف
 getProductById: async (id: number): Promise<Product> => {
   try {
     const response = await axios.get<Product>(`${API_URL}/products/${id}`);
     return {        
       ...response.data,
       images: response.data.images?.map(img => ({
           ...img,
           imageUrl: img.imageUrl.startsWith('/') 
               ? `${IMAGE_URL}${img.imageUrl}`
               : `${IMAGE_URL}/images/${img.imageUrl}`
       })) || []
     }; 
   } catch (error) {
     console.error('Error fetching product:', error);
     throw error;
   }
 },
 
 // تحديث منتج
 updateProduct: async (id: number, productData: CreateProductDto): Promise<Product> => {  
   const token = localStorage.getItem('token');
   try {
     const response = await axios.put<Product>(
       `${API_URL}/products/${id}`, 
       productData,
       {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       }
     );
     return response.data;
   } catch (error) {
     console.error('Error updating product:', error);
     throw error;
   }
 },

 // حذف منتج
 deleteProduct: async (id: number): Promise<void> => {
   const token = localStorage.getItem('token');  
   try {
     await axios.delete(`${API_URL}/products/${id}`, {
       headers: {
         'Authorization': `Bearer ${token}`  
       }
     });
   } catch (error) {
     console.error('Error deleting product:', error);
     throw error;
   }
 },

 
  
 // إضافة صورة لمنتج
 addProductImage: async (id: number, imageFile: File): Promise<ProductImage> => {
   const token = localStorage.getItem('token');
   const formData = new FormData();
   formData.append('image', imageFile);
   
   const response = await axios.post<ProductImage>(
       `${API_URL}/products/${id}/images`,
       formData,
       {
           headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'multipart/form-data'
           }
       }
   );
   
   return {
       ...response.data,
       imageUrl: response.data.imageUrl.startsWith('/') 
           ? `${IMAGE_URL}${response.data.imageUrl}`
           : `${IMAGE_URL}/images/${response.data.imageUrl}`
   };
 },
 addToCart: async (productId: number, quantity: number): Promise<string> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post<string>(
      `${API_URL}/cart/add`,
      { productId, quantity },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Product added to cart:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding product to cart:', error);
    throw error;
  }
},
 

 // البحث عن المنتجات
 searchProducts: async (params: SearchProductsParams): Promise<Product[]> => {
   try {
     const searchParams = new URLSearchParams();  
     if (params.query) searchParams.append('query', params.query);
     if (params.category) searchParams.append('category', params.category);
     
     const response = await axios.get<Product[]>(
       `${API_URL}/products/search?${searchParams}`
     );
     
     return response.data.map(product => ({
       ...product,
       images: product.images?.map(img => ({
           ...img,
           imageUrl: img.imageUrl.startsWith('/') 
               ? `${IMAGE_URL}${img.imageUrl}`
               : `${IMAGE_URL}/images/${img.imageUrl}`
       })) || []
     }));
   } catch (error) {
     console.error('Error searching products:', error);
     throw error;
   }
 }

};