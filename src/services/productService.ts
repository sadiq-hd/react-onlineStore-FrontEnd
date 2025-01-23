import axios from 'axios';
import { 
 Product, 
 CreateProductDto, 
 SearchProductsParams, 
 ProductImage 
} from '../types/product';
import { CartItem } from '../typerScript/cart';

const API_URL = 'https://localhost:5000/api';
const IMAGE_URL = 'https://localhost:5000';

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