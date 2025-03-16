// src/types/discount.ts

// أنواع التخفيض
export enum DiscountType {
  Percentage = 0,
  FixedAmount = 1
}

// نطاق تطبيق التخفيض
export enum DiscountScope {
  AllProducts = 0,
  Category = 1,
  Product = 2
}

// كائن منتج التخفيض
export interface DiscountProduct {
  id?: number;
  discountId?: number;
  productId: number;
}

// كائن التخفيض الكامل
export interface Discount {
  id: number;
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  categoryName?: string;
  products?: DiscountProduct[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: Date;
}

// DTO لإنشاء أو تحديث التخفيض
export interface CreateDiscountDto {
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  categoryName?: string | null;
  productIds?: number[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// دوال مساعدة للتعامل مع التخفيضات
export const calculateDiscountedPrice = (
  originalPrice: number,
  discountValue: number,
  discountType: DiscountType
): number => {
  if (discountType === DiscountType.Percentage) {
    return Math.round((originalPrice * (1 - discountValue / 100)) * 100) / 100;
  } else {
    return Math.max(0, Math.round((originalPrice - discountValue) * 100) / 100);
  }
};

export const formatDiscountValue = (value: number, type: DiscountType): string => {
  return `${value}${type === DiscountType.Percentage ? '%' : ' ريال'}`;
};

export const getDiscountTypeText = (type: DiscountType | string): string => {
  if (typeof type === 'string') {
    if (type === 'Percentage') return 'نسبة مئوية';
    if (type === 'FixedAmount') return 'مبلغ ثابت';
    
    const numericType = parseInt(type, 10);
    if (!isNaN(numericType)) {
      return numericType === DiscountType.Percentage ? 'نسبة مئوية' : 'مبلغ ثابت';
    }
    
    return type;
  }
  
  return type === DiscountType.Percentage ? 'نسبة مئوية' : 'مبلغ ثابت';
};

export const getDiscountScopeText = (scope: DiscountScope | string, categoryName?: string): string => {
  if (typeof scope === 'string') {
    if (scope === 'AllProducts' || scope === 'Global') return 'جميع المنتجات';
    if (scope === 'Category') return `فئة: ${categoryName || 'غير محددة'}`;
    if (scope === 'Product') return 'منتجات محددة';
    
    const numericScope = parseInt(scope, 10);
    if (!isNaN(numericScope)) {
      if (numericScope === DiscountScope.AllProducts) return 'جميع المنتجات';
      if (numericScope === DiscountScope.Category) return `فئة: ${categoryName || 'غير محددة'}`;
      if (numericScope === DiscountScope.Product) return 'منتجات محددة';
    }
    
    return scope;
  }
  
  if (scope === DiscountScope.AllProducts) return 'جميع المنتجات';
  if (scope === DiscountScope.Category) return `فئة: ${categoryName || 'غير محددة'}`;
  if (scope === DiscountScope.Product) return 'منتجات محددة';
  
  return `نطاق: ${scope}`;
};