// تعديلات في discountService.ts

import api from '../config/axios';
import { DiscountType, DiscountScope, Discount, CreateDiscountDto } from '../types/discount';
import { Product } from '../types/product';

class DiscountService {
  private readonly baseUrl = 'https://localhost:5000/api/Discounts';

  async getDiscountForCartItem(productId: number, categoryName: string): Promise<{
    hasDiscount: boolean;
    discountedPrice?: number;
    discountValue?: number;
    discountType?: DiscountType;
    discountName?: string;
    originalPrice?: number;
  }> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get<{
        discount: Discount;
        product: Product;
      }>(`${this.baseUrl}/cart-discount`, {
        params: { productId, categoryName },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const { discount, product } = response.data;
        const originalPrice = product.price;
        let discountedPrice: number | undefined;

        // حساب السعر بعد الخصم
        if (discount.type === DiscountType.Percentage) {
          discountedPrice = this.calculateDiscountedPrice(
            originalPrice, 
            discount.value, 
            DiscountType.Percentage
          );
        } else if (discount.type === DiscountType.FixedAmount) {
          discountedPrice = this.calculateDiscountedPrice(
            originalPrice, 
            discount.value, 
            DiscountType.FixedAmount
          );
        }

        return {
          hasDiscount: true,
          discountedPrice,
          discountValue: discount.value,
          discountType: discount.type,
          discountName: discount.name,
          originalPrice
        };
      }

      return {
        hasDiscount: false
      };
    } catch (error) {
      console.error('Error fetching cart item discount:', error);
      return {
        hasDiscount: false
      };
    }
  }

  // دالة مساعدة لحساب السعر بعد الخصم
  private calculateDiscountedPrice(
    originalPrice: number, 
    discountValue: number, 
    discountType: DiscountType
  ): number {
    if (discountType === DiscountType.Percentage) {
      // تقريب الناتج إلى رقمين عشريين
      return Math.round((originalPrice * (1 - discountValue / 100)) * 100) / 100;
    } else if (discountType === DiscountType.FixedAmount) {
      // تقريب الناتج إلى رقمين عشريين
      return Math.round(Math.max(originalPrice - discountValue, 0) * 100) / 100;
    }
    return originalPrice;
  }

  async getAllDiscounts(): Promise<Discount[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get<Discount[]>(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching discounts:', error);
      throw error;
    }
  }

  async getDiscount(id: number): Promise<Discount> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get<Discount>(`${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching discount ${id}:`, error);
      throw error;
    }
  }

  async createDiscount(discount: CreateDiscountDto): Promise<Discount> {
    try {
      const token = localStorage.getItem('token');
      
      // تصحيح بيانات الخصم قبل الإرسال
      const fixedDiscount = {
        ...discount,
        // تحويل القيم إلى الأنواع المناسبة
        type: Number(discount.type),
        value: Number(discount.value),
        scope: Number(discount.scope),
        // تعيين القيم المناسبة حسب نطاق الخصم
        categoryName: Number(discount.scope) === DiscountScope.Category ? discount.categoryName : null,
        productIds: Number(discount.scope) === DiscountScope.Product ? discount.productIds : []
      };
      
      console.log("Sending discount data:", JSON.stringify(fixedDiscount, null, 2));
      
      const response = await api.post<Discount>(this.baseUrl, fixedDiscount, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  }

  async updateDiscount(id: number, discount: CreateDiscountDto): Promise<Discount> {
    try {
      const token = localStorage.getItem('token');
      
      // تصحيح بيانات الخصم قبل الإرسال
      const fixedDiscount = {
        ...discount,
        // تحويل القيم إلى الأنواع المناسبة
        type: Number(discount.type),
        value: Number(discount.value),
        scope: Number(discount.scope),
        // تعيين القيم المناسبة حسب نطاق الخصم
        categoryName: Number(discount.scope) === DiscountScope.Category ? discount.categoryName : null,
        // التأكد من أن productIds هو مصفوفة
        productIds: Array.isArray(discount.productIds) ? discount.productIds : 
                  (Number(discount.scope) === DiscountScope.Product && discount.productIds ? discount.productIds : [])
      };
      
      console.log("Updating discount data:", JSON.stringify(fixedDiscount, null, 2));
      
      // إضافة مهلة أطول للطلب في حالة الشبكات البطيئة
      const response = await api.put<Discount>(`${this.baseUrl}/${id}`, fixedDiscount, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 ثوان مهلة للطلب
      });
      
      console.log("Server response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating discount ${id}:`, error);
      
      // تسجيل المزيد من التفاصيل حول الخطأ
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received, request details:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      
      throw error;
    }
  }

  async deleteDiscount(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      console.log(`Deleting discount with ID: ${id}`);
      
      await api.delete(`${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`Successfully deleted discount with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting discount ${id}:`, error);
      throw error;
    }
  }

  async getApplicableDiscounts(productId: number, categoryName: string): Promise<Discount[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get<Discount[]>(`${this.baseUrl}/applicable`, {
        params: { productId, categoryName },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching applicable discounts:', error);
      throw error;
    }
  }
}

export const discountService = new DiscountService();