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

// نوع الصورة
export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
}

// نوع المنتج الكامل
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  images: ProductImage[];
  createdAt: string;  
  updatedAt: string;  
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

// نوع لإنشاء منتج جديد (بدون id و images)
export type CreateProductDto = Omit<Product, 'id' | 'images'>;

// نوع لتحديث منتج
export type UpdateProductDto = CreateProductDto;

// نوع للبحث عن المنتجات
export interface SearchProductsParams {
  query?: string;
  category?: ProductCategory;
}

// نوع حالة المخزون
export enum StockStatus {
  IN_STOCK = 'متوفر',
  LOW_STOCK = 'كمية محدودة',
  OUT_OF_STOCK = 'نفذ المخزون'
}

// وظائف مساعدة
export const getStockStatus = (stock: number): StockStatus => {
  if (stock > 10) return StockStatus.IN_STOCK;
  if (stock > 0) return StockStatus.LOW_STOCK;
  return StockStatus.OUT_OF_STOCK;
};

export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price);
};

export const isValidStock = (stock: number): boolean => {
  return stock >= 0 && Number.isInteger(stock);
};