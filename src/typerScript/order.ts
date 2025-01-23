import { Product } from "../types/product";

export enum PaymentMethodType {
   CREDIT_CARD = 'CREDIT_CARD',
   MADA = 'MADA',
   APPLE_PAY = 'APPLE_PAY',
   SAMSUNG_PAY = 'SAMSUNG_PAY',
   GOOGLE_PAY = 'GOOGLE_PAY',
   STC_PAY = 'STC_PAY',
   CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
   PAYPAL = 'PAYPAL'
}

export enum PaymentStatus {
   Pending = 'Pending',
   Processing = 'Processing',
   Completed = 'Completed',
   Failed = 'Failed',
   Refunded = 'Refunded'
}

export enum OrderStatus {
   Pending = 'Pending',
   Processing = 'Processing',
   Shipped = 'Shipped',
   Delivered = 'Delivered',
   Cancelled = 'Cancelled'
}

export interface DeliveryAddress {
   fullName: string;
   phoneNumber: string;
   city: string;
   street: string;
   buildingNumber?: string;
   additionalDetails?: string;
}

export interface CreateOrderDto {
   address: DeliveryAddress;
   paymentMethod: PaymentMethodType;
   paymentDetails?: Record<string, string>;
}

export interface Order {
    id: number;
    orderDate: string;
    status: OrderStatus;
    subTotal: number;
    vatAmount: number;
    totalAmount: number;
    deliveryFee: number;
    finalAmount: number;
    items: OrderItemDto[];
    paymentDetails: PaymentDetailsDto;
    deliveryAddress: DeliveryAddress;
}

export interface OrderResponseDto {
    id: number;
    orderDate: string;
    status: OrderStatus;
    subTotal: number;
    vatAmount: number;
    totalAmount: number;
    deliveryFee: number;
    finalAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethodType;
    items: OrderItemDto[];
    deliveryAddress: DeliveryAddress;
    paymentDetails?: PaymentDetailsDto;
}

export interface OrderItemDto {
   productId: number;
   productName: string;
   quantity: number;
   price: number;
   total: number;
   vatAmount?: number;
   totalWithVat?: number;
}

export interface PaymentDetailsDto {
   paymentMethod: string;
   status: string;
   paidAt?: string;
   transactionId?: string;
   errorMessage?: string;
   isRefunded?: boolean;
   refundedAt?: string;
   refundAmount?: number;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
   [OrderStatus.Pending]: 'قيد الانتظار',
   [OrderStatus.Processing]: 'قيد المعالجة',
   [OrderStatus.Shipped]: 'تم الشحن',
   [OrderStatus.Delivered]: 'تم التوصيل',
   [OrderStatus.Cancelled]: 'ملغي'
};

export interface PaymentField {
   name: string;
   label: string;
   type: string;
   placeholder: string;
   validation: (value: string) => boolean;
}

export interface PaymentMethodConfig {
   id: PaymentMethodType;
   label: string;
   icon: string;
   fields: PaymentField[];
}

const CARD_PATTERNS = {
   visa: /^4[0-9]{5}/,
   mastercard: /^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[0-1][0-9]|2720)/,
   amex: /^3[47][0-9]{4}/,
   mada: /^(5888|5890|6051|6361)/
};

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
   {
       id: PaymentMethodType.CREDIT_CARD,
       label: 'بطاقة ائتمانية',
       icon: '💳',
       fields: [
           {
               name: 'cardNumber',
               label: 'رقم البطاقة',
               type: 'text',
               placeholder: 'XXXX-XXXX-XXXX-XXXX',
               validation: (value: string) => {
                   // Remove any non-digit characters
                   const cleaned = value.replace(/\D/g, '');
                   
                   // Check if it contains exactly 16 digits
                   if (cleaned.length !== 16) return false;
                   
                   // Check if it matches any of our accepted card patterns
                   if (!(CARD_PATTERNS.visa.test(cleaned) || 
                        CARD_PATTERNS.mastercard.test(cleaned) ||
                        CARD_PATTERNS.amex.test(cleaned))) {
                       return false;
                   }
                   
                   // Validate using Luhn algorithm
                   return validateCardNumber(cleaned);
               }
           },
           {
               name: 'expiryDate',
               label: 'تاريخ الانتهاء',
               type: 'text',
               placeholder: 'MM/YY',
               validation: (value: string) => {
                   const regex = /^([0-9]{2})\/([0-9]{2})$/;
                   if (!regex.test(value)) {
                       return false;
                   }

                   const [month, year] = value.split('/').map(num => parseInt(num));
                   if (month < 1 || month > 12) {
                       return false;
                   }

                   const now = new Date();
                   const currentYear = now.getFullYear() % 100;
                   const currentMonth = now.getMonth() + 1;

                   return year >= currentYear && (year > currentYear || month >= currentMonth);
               }
           },
           {
               name: 'cvv',
               label: 'رمز الحماية',
               type: 'password',
               placeholder: 'XXX',
               validation: (value: string) => /^[0-9]{3}$/.test(value)
           }
       ]
   },
   {
       id: PaymentMethodType.MADA,
       label: 'مدى',
       icon: '💳',
       fields: [
           {
               name: 'cardNumber',
               label: 'رقم البطاقة',
               type: 'text',
               placeholder: 'XXXX-XXXX-XXXX-XXXX',
               validation: (value: string) => {
                   const cleaned = value.replace(/\s/g, '');
                   return cleaned.length === 16 && CARD_PATTERNS.mada.test(cleaned);
               }
           },
           {
               name: 'expiryDate',
               label: 'تاريخ الانتهاء',
               type: 'text',
               placeholder: 'MM/YY',
               validation: (value: string) => {
                   const regex = /^([0-9]{2})\/([0-9]{2})$/;
                   if (!regex.test(value)) {
                       return false;
                   }

                   const [month, year] = value.split('/').map(num => parseInt(num));
                   if (month < 1 || month > 12) {
                       return false;
                   }

                   const now = new Date();
                   const currentYear = now.getFullYear() % 100;
                   const currentMonth = now.getMonth() + 1;

                   return year >= currentYear && (year > currentYear || month >= currentMonth);
               }
           },
           {
               name: 'cvv',
               label: 'رمز الحماية',
               type: 'password',
               placeholder: 'XXX',
               validation: (value: string) => /^[0-9]{3}$/.test(value)
           }
       ]
   },
   {
       id: PaymentMethodType.APPLE_PAY,
       label: 'آبل باي',
       icon: '🍎',
       fields: []
   },
   {
       id: PaymentMethodType.GOOGLE_PAY,
       label: 'قوقل باي',
       icon: '🌐',
       fields: []
   },
   {
       id: PaymentMethodType.SAMSUNG_PAY,
       label: 'سامسونج باي',
       icon: '📱',
       fields: []
   },
   {
       id: PaymentMethodType.STC_PAY,
       label: 'STC Pay',
       icon: '📲',
       fields: [
           {
               name: 'phone',
               label: 'رقم الجوال',
               type: 'tel',
               placeholder: '05XXXXXXXX',
               validation: (value: string) => /^05[0-9]{8}$/.test(value)
           }
       ]
   },
   {
       id: PaymentMethodType.CASH_ON_DELIVERY,
       label: 'الدفع عند الاستلام',
       icon: '💰',
       fields: [
           {
               name: 'phone',
               label: 'رقم الجوال للتواصل',
               type: 'tel',
               placeholder: '05XXXXXXXX',
               validation: (value: string) => /^05[0-9]{8}$/.test(value)
           }
       ]
   },
   {
       id: PaymentMethodType.PAYPAL,
       label: 'PayPal',
       icon: '🅿️',
       fields: []
   }
];

export const formatCurrency = (amount: number): string => {
   return new Intl.NumberFormat('ar-SA', {
       style: 'currency',
       currency: 'SAR'
   }).format(amount);
};

export const formatCardNumber = (value: string): string => {
    return value.replace(/\s/g, '')
                .replace(/(\d{4})/g, '$1 ')
                .trim();
};

export const validateCardNumber = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
};

export const getCardType = (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (CARD_PATTERNS.visa.test(cleaned)) return 'Visa';
    if (CARD_PATTERNS.mastercard.test(cleaned)) return 'Mastercard';
    if (CARD_PATTERNS.amex.test(cleaned)) return 'American Express';
    if (CARD_PATTERNS.mada.test(cleaned)) return 'Mada';
    
    return 'Unknown';
};

export const validateExpiryDate = (value: string): boolean => {
    // Only allow digits and forward slash in correct format MM/YY
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) return false;

    const [month, year] = value.split('/').map(num => parseInt(num));
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    // Check if card is expired
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }

    // Check if date is too far in the future (e.g., more than 10 years)
    if (year > currentYear + 10) {
        return false;
    }

    return true;
};

export const formatExpiryDate = (value: string): string => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Only take first 4 digits
    const limited = cleaned.slice(0, 4);
    
    // Add slash after first 2 digits if we have more than 2 digits
    if (limited.length >= 2) {
        const month = limited.slice(0, 2);
        // Ensure month is between 01 and 12
        if (parseInt(month) > 12) {
            return '12' + (limited.length > 2 ? '/' + limited.slice(2) : '');
        }
        if (parseInt(month) === 0) {
            return '01' + (limited.length > 2 ? '/' + limited.slice(2) : '');
        }
        return month + (limited.length > 2 ? '/' + limited.slice(2) : '');
    }
    
    return limited;
};

export const calculateVat = (amount: number): number => {
    return Math.round(amount * 0.15 * 100) / 100;
};

export const getPaymentMethodLabel = (method: PaymentMethodType): string => {
    const paymentMethod = PAYMENT_METHODS.find(m => m.id === method);
    return paymentMethod?.label || method;
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
    const statusMap: Record<PaymentStatus, string> = {
        [PaymentStatus.Pending]: 'في انتظار الدفع',
        [PaymentStatus.Processing]: 'قيد المعالجة',
        [PaymentStatus.Completed]: 'تم الدفع',
        [PaymentStatus.Failed]: 'فشل الدفع',
        [PaymentStatus.Refunded]: 'تم الاسترجاع'
    };
    return statusMap[status];
};