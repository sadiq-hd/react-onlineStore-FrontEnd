import api, { API_CONFIG, formatImageUrl, handleApiError } from '../config/apiConfig';

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

// دالة مساعدة لتنسيق عنوان الصورة من المنتج
const formatProductImageUrl = (product: Product): string => {
    // إذا لم يكن هناك صور أصلاً، نرجع الصورة البديلة مباشرة
    if (!product.images || product.images.length === 0) {
        return API_CONFIG.FALLBACK_IMAGE;
    }

    const imageUrl = product.images[0].imageUrl;
    if (!imageUrl) {
        return API_CONFIG.FALLBACK_IMAGE;
    }

    // استخدام الدالة المركزية لتنسيق عنوان الصورة
    return formatImageUrl(imageUrl);
};

export const wishlistService = {
    async getWishlist(): Promise<FavoriteItem[]> {
        try {
            const response = await api.get<Product[]>('/Wishlist');

            return response.data.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                category: product.category,
                stock: product.stock,
                imageUrl: formatProductImageUrl(product)
            }));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            throw handleApiError(error);
        }
    },

    async addToWishlist(productId: number): Promise<void> {
        try {
            await api.post(`/Wishlist/${productId}`);
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw handleApiError(error);
        }
    },

    async removeFromWishlist(productId: number): Promise<void> {
        try {
            await api.delete(`/Wishlist/${productId}`);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw handleApiError(error);
        }
    },

    async clearWishlist(): Promise<void> {
        try {
            await api.delete('/Wishlist/clear');
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            throw handleApiError(error);
        }
    },

    // دالة مساعدة للتحقق مما إذا كان العنصر موجودًا في قائمة الرغبات
    async isInWishlist(productId: number): Promise<boolean> {
        try {
            const items = await this.getWishlist();
            return items.some(item => item.id === productId);
        } catch {
            return false;
        }
    }
};