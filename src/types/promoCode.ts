export enum PromoCodeType {
    Percentage = 0,
    FixedAmount = 1
  }
  
  export interface PromoCode {
    id: number;
    code: string;
    description: string;
    type: PromoCodeType;
    value: number;
    minimumOrderAmount?: number;
    maxUsesTotal?: number;
    maxUsesPerUser?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: Date;
    usageCount?: number;
  }
  
  export interface PromoCodeValidationResult {
    isValid: boolean;
    message: string;
    discountAmount?: number;
    promoCode?: PromoCode;
  }