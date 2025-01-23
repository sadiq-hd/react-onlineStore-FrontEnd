import axios from 'axios';
import { handleAxiosError } from '../components/handleAxiosError';

const API_URL = 'https://localhost:5000/api';
const IMAGE_URL = 'https://localhost:5000';
const FALLBACK_IMAGE = 'https://via.placeholder.com/200x200?text=صورة+غير+متوفرة';

export interface FavoriteItem {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    category: string;
    stock: number;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    stock: number;
    images: { imageUrl: string }[];
}

const formatImageUrl = (product: Product): string => {
    // إذا لم يكن هناك صور أصلاً، نرجع الصورة البديلة مباشرة
    if (!product.images || product.images.length === 0) {
        return FALLBACK_IMAGE;
    }

    const imageUrl = product.images[0].imageUrl;
    if (!imageUrl) {
        return FALLBACK_IMAGE;
    }

    // تنظيف وتنسيق مسار الصورة
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }

    const cleanPath = imageUrl
        .replace(/^\/+/, '')
        .replace(/^images\//, '')
        .replace(/^api\/images\//, '');

    return `${IMAGE_URL}/images/${cleanPath}`;
};

export const wishlistService = {
    async getWishlist(): Promise<FavoriteItem[]> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('لم يتم العثور على رمز المصادقة');
            }

            const response = await axios.get<Product[]>(`${API_URL}/Wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                category: product.category,
                stock: product.stock,
                imageUrl: formatImageUrl(product)
            }));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            throw handleAxiosError(error);
        }
    },

    async addToWishlist(productId: number): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('لم يتم العثور على رمز المصادقة');
            }

            await axios.post(`${API_URL}/Wishlist/${productId}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw handleAxiosError(error);
        }
    },

    async removeFromWishlist(productId: number): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('لم يتم العثور على رمز المصادقة');
            }

            await axios.delete(`${API_URL}/Wishlist/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw handleAxiosError(error);
        }
    },

    async clearWishlist(): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('لم يتم العثور على رمز المصادقة');
            }

            await axios.delete(`${API_URL}/Wishlist/clear`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            throw handleAxiosError(error);
        }
    },

    // Helper method for checking if an item is in the wishlist
    async isInWishlist(productId: number): Promise<boolean> {
        try {
            const items = await this.getWishlist();
            return items.some(item => item.id === productId);
        } catch {
            return false;
        }
    }
};