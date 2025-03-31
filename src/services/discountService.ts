// src/services/discountService.ts
import api, { handleApiError } from '../config/apiConfig';
import { DiscountType, DiscountScope, Discount, CreateDiscountDto } from '../types/discount';
import { Product } from '../types/product';

class DiscountService {
  // استخدام المسار النسبي 
  private readonly basePath = '/Discounts';

  // دالة مساعدة لتحويل النص إلى نوع التخفيض المناسب
  private parseDiscountType(typeValue: string | number): DiscountType {
    if (typeof typeValue === 'string') {
      if (typeValue === 'Percentage') return DiscountType.Percentage;
      if (typeValue === 'FixedAmount') return DiscountType.FixedAmount;

      const numericValue = parseInt(typeValue, 10);
      if (!isNaN(numericValue)) {
        return numericValue;
      }
    }
    return Number(typeValue);
  }

  // دالة مساعدة لتحويل النص إلى نطاق التخفيض المناسب
  private parseDiscountScope(scopeValue: string | number): DiscountScope {
    if (typeof scopeValue === 'string') {
      if (scopeValue === 'AllProducts') return DiscountScope.AllProducts;
      if (scopeValue === 'Category') return DiscountScope.Category;
      if (scopeValue === 'Product') return DiscountScope.Product;
      if (scopeValue === 'Global') return DiscountScope.AllProducts; // الخادم قد يستخدم "Global"

      const numericValue = parseInt(scopeValue, 10);
      if (!isNaN(numericValue)) {
        return numericValue;
      }
    }
    return Number(scopeValue);
  }

  // دالة مساعدة لتحويل كائن التخفيض القادم من الخادم إلى الهيكل المناسب للواجهة
  private normalizeDiscount(serverDiscount: any): Discount {
    const normalizedType = this.parseDiscountType(serverDiscount.type);
    const normalizedScope = this.parseDiscountScope(serverDiscount.scope);

    // تحويل المنتجات إلى الهيكل المناسب
    const normalizedProducts = serverDiscount.products?.map((p: any) => ({
      productId: p.id
    })) || [];

    return {
      id: serverDiscount.id,
      name: serverDiscount.name,
      description: serverDiscount.description,
      type: normalizedType,
      value: serverDiscount.value,
      scope: normalizedScope,
      categoryName: serverDiscount.categoryName,
      products: normalizedProducts,
      startDate: serverDiscount.startDate,
      endDate: serverDiscount.endDate,
      isActive: serverDiscount.isActive,
      createdAt: new Date(serverDiscount.createdAt)
    };
  }

  async getDiscountForCartItem(productId: number, categoryName: string): Promise<{
    hasDiscount: boolean;
    discountedPrice?: number;
    discountValue?: number;
    discountType?: DiscountType;
    discountName?: string;
    originalPrice?: number;
  }> {
    try {
      const response = await api.get<{
        discount: Discount;
        product: Product;
      }>(`${this.basePath}/cart-discount`, {
        params: { productId, categoryName }
      });

      if (response.data) {
        const { discount, product } = response.data;
        const originalPrice = product.price;
        const normalizedType = this.parseDiscountType(discount.type);
        
        // حساب السعر بعد الخصم
        const discountedPrice = this.calculateDiscountedPrice(
          originalPrice, 
          discount.value, 
          normalizedType
        );

        return {
          hasDiscount: true,
          discountedPrice,
          discountValue: discount.value,
          discountType: normalizedType,
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
    } else {
      // تقريب الناتج إلى رقمين عشريين
      return Math.round(Math.max(originalPrice - discountValue, 0) * 100) / 100;
    }
  }

  async getAllDiscounts(): Promise<Discount[]> {
    try {
      const response = await api.get<any[]>(this.basePath);
      return response.data.map(discount => this.normalizeDiscount(discount));
    } catch (error) {
      console.error('Error fetching discounts:', error);
      throw handleApiError(error);
    }
  }

  async getDiscount(id: number): Promise<Discount> {
    try {
      const response = await api.get<any>(`${this.basePath}/${id}`);
      return this.normalizeDiscount(response.data);
    } catch (error) {
      console.error(`Error fetching discount ${id}:`, error);
      throw handleApiError(error);
    }
  }

  async createDiscount(discount: CreateDiscountDto): Promise<Discount> {
    try {
      // تحضير البيانات بالشكل المناسب للخادم
      const requestData: {
        name: string;
        description: string;
        type: number;
        value: number;
        scope: number;
        categoryName: string | null | undefined;
        productIds: number[] | null;
        startDate: string;
        endDate: string;
        isActive: boolean;
      } = {
        name: discount.name,
        description: discount.description,
        type: Number(discount.type),
        value: Number(discount.value),
        scope: Number(discount.scope),
        categoryName: Number(discount.scope) === DiscountScope.Category ? discount.categoryName : null,
        // تصحيح مشكلة نوع productIds
        productIds: Number(discount.scope) === DiscountScope.Product ? 
                  (discount.productIds ? [...discount.productIds] : []) : null,
        startDate: discount.startDate,
        endDate: discount.endDate,
        isActive: discount.isActive
      };
      
      console.log("Sending discount data:", JSON.stringify(requestData, null, 2));
      
      const response = await api.post<any>(this.basePath, requestData);
      return this.normalizeDiscount(response.data);
    } catch (error) {
      console.error('Error creating discount:', error);
      throw handleApiError(error);
    }
  }

  async updateDiscount(id: number, discount: CreateDiscountDto): Promise<Discount> {
    try {
      // تحضير البيانات بالشكل المناسب للخادم
      const requestData: {
        name: string;
        description: string;
        type: number;
        value: number;
        scope: number;
        categoryName: string | null | undefined;
        productIds: number[] | null;
        startDate: string;
        endDate: string;
        isActive: boolean;
      } = {
        name: discount.name,
        description: discount.description,
        type: Number(discount.type),
        value: Number(discount.value),
        scope: Number(discount.scope),
        categoryName: Number(discount.scope) === DiscountScope.Category ? discount.categoryName : null,
        // تصحيح مشكلة نوع productIds
        productIds: Number(discount.scope) === DiscountScope.Product ? 
                  (discount.productIds ? [...discount.productIds] : []) : null,
        startDate: discount.startDate,
        endDate: discount.endDate,
        isActive: discount.isActive
      };
      
      console.log("Updating discount data:", JSON.stringify(requestData, null, 2));
      
      // إضافة مهلة أطول للطلب في حالة الشبكات البطيئة
      const response = await api.put<any>(
        `${this.basePath}/${id}`, 
        requestData, 
        { timeout: 15000 } // 15 ثانية مهلة للطلب
      );
      
      return this.normalizeDiscount(response.data);
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
      
      throw handleApiError(error);
    }
  }

  async deleteDiscount(id: number): Promise<void> {
    try {
      console.log(`Deleting discount with ID: ${id}`);
      
      await api.delete(`${this.basePath}/${id}`);
      
      console.log(`Successfully deleted discount with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting discount ${id}:`, error);
      throw handleApiError(error);
    }
  }

  async getApplicableDiscounts(productId: number, categoryName: string): Promise<Discount[]> {
    try {
      const response = await api.get<any[]>(`${this.basePath}/applicable`, {
        params: { productId, categoryName }
      });
      return response.data.map(discount => this.normalizeDiscount(discount));
    } catch (error) {
      console.error('Error fetching applicable discounts:', error);
      throw handleApiError(error);
    }
  }
}

export const discountService = new DiscountService();