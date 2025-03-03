export enum DiscountType {
    Percentage = 0,
    FixedAmount = 1
  }
  
  export enum DiscountScope {
    AllProducts = 0,
    Category = 1,
    Product = 2
  }
  
  export interface DiscountProduct {
    id?: number;
    discountId?: number;
    productId: number;
  }
  
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