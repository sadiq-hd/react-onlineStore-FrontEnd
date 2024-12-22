export interface SearchProductsParams {
  query?: string;
  category?: string;
}

// نوع الصورة
export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
}

// نوع الفئات المتاحة
export const PRODUCT_CATEGORIES = [
  'سماعات',
  'ساعات',
  'حقائب',
  'شواحن',
  'مستلزمات الكمبيوتر'
] as const;

// نوع لفئات المنتجات
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// نوع المنتج الكامل
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory; // استخدام النوع المحدد للفئات
  images: ProductImage[];
}

// نوع لإنشاء منتج جديد (بدون id و images)
export type CreateProductDto = Omit<Product, 'id' | 'images'>;

// نوع لتحديث منتج
export type UpdateProductDto = CreateProductDto;

// نوع للاستجابة عند إضافة الصور
export interface ProductImageResponse {
  id: number;
  productId: number;
  imageUrl: string;
}

// نوع لحالة المخزون
export enum StockStatus {
  IN_STOCK = 'متوفر',
  LOW_STOCK = 'كمية محدودة',
  OUT_OF_STOCK = 'نفذ المخزون'
}

// وظيفة مساعدة لتحديد حالة المخزون
export const getStockStatus = (stock: number): StockStatus => {
  if (stock > 10) return StockStatus.IN_STOCK;
  if (stock > 0) return StockStatus.LOW_STOCK;
  return StockStatus.OUT_OF_STOCK;
};

// وظيفة مساعدة للتحقق من صحة السعر
export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price);
};

// وظيفة مساعدة للتحقق من صحة المخزون
export const isValidStock = (stock: number): boolean => {
  return stock >= 0 && Number.isInteger(stock);
};