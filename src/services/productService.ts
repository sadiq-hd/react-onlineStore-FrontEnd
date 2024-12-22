import axios from 'axios';
import { Product, SearchProductsParams } from '../types/product';

const API_URL = 'https://localhost:5000/api';

export const productService = {
  // GET /api/Products
  getAllProducts: async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  // POST /api/Products
  addProduct: async (productData: Omit<Product, 'id' | 'images'>) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/products`, productData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // GET /api/Products/{id}
  getProductById: async (id: number) => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  // PUT /api/Products/{id}
  updateProduct: async (id: number, productData: Omit<Product, 'id' | 'images'>) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/products/${id}`, productData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // DELETE /api/Products/{id}
  deleteProduct: async (id: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // POST /api/Products/{id}/images
  addProductImage: async (id: number, imageFile: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(
      `${API_URL}/products/${id}/images`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // GET /api/Products/search
  searchProducts: async (params: SearchProductsParams): Promise<Product[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.append('query', params.query);
      if (params.category) searchParams.append('category', params.category);

      const response = await axios.get<Product[]>(
        `${API_URL}/products/search?${searchParams}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};