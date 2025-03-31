// src/components/ConfirmOrder.tsx
import React from 'react';
import { CartItem } from '../typerScript/cart';
import { DeliveryAddress, PaymentMethodType } from '../typerScript/order';
import { formatCurrency } from '../typerScript/order';

interface ConfirmOrderProps {
  cartItems: CartItem[];
  address: DeliveryAddress;
  onAddressChange: (field: keyof DeliveryAddress, value: string) => void;
  originalSubTotal: number;
  subTotal: number;
  discountAmount: number;
  vatAmount: number;
  deliveryFee: number;
  finalAmount: number;
  paymentMethod: PaymentMethodType | null;
  paymentDetails: Record<string, string>;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
  termsAccepted: boolean;
  onTermsAcceptedChange: (checked: boolean) => void;
}

const ConfirmOrder: React.FC<ConfirmOrderProps> = ({
  cartItems,
  address,
  onAddressChange,
  originalSubTotal,
  subTotal,
  discountAmount,
  vatAmount,
  deliveryFee,
  finalAmount,
  paymentMethod,
  paymentDetails,
  loading,
  onBack,
  onSubmit,
  termsAccepted,
  onTermsAcceptedChange
}) => {
  // تحويل نوع الدفع إلى نص مفهوم
  const getPaymentMethodText = (method: PaymentMethodType | null): string => {
    switch (method) {
      case PaymentMethodType.CASH_ON_DELIVERY:
        return 'الدفع عند الاستلام';
      case PaymentMethodType.CREDIT_CARD:
        return 'بطاقة ائتمان';
      case PaymentMethodType.MADA:
        return 'مدى';
      default:
        return 'غير محدد';
    }
  };

  // الحصول على آخر 4 أرقام من بطاقة الائتمان للعرض
  const getCardLastDigits = (): string => {
    if (
      (paymentMethod === PaymentMethodType.CREDIT_CARD || 
       paymentMethod === PaymentMethodType.MADA) && 
      paymentDetails.cardNumber
    ) {
      const cardNum = paymentDetails.cardNumber.replace(/\s/g, '');
      return cardNum.slice(-4);
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">تأكيد الطلب</h2>
      
      {/* ملخص منتجات السلة */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-right">المنتجات</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-right">
            <thead className="border-b">
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-gray-600">المنتج</th>
                <th className="py-3 px-4 text-gray-600">الكمية</th>
                <th className="py-3 px-4 text-gray-600">السعر الأصلي</th>
                <th className="py-3 px-4 text-gray-600">السعر بعد الخصم</th>
                <th className="py-3 px-4 text-gray-600">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.productId} className="border-b">
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">
                    {item.hasDiscount && item.discountedPrice !== undefined
                      ? <span className="line-through text-gray-500">{formatCurrency(item.price)}</span>
                      : formatCurrency(item.price)}
                  </td>
                  <td className="py-3 px-4">
                    {item.hasDiscount && item.discountedPrice !== undefined
                      ? <span className="text-green-600">{formatCurrency(item.discountedPrice)}</span>
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {formatCurrency(
                      item.hasDiscount && item.discountedPrice !== undefined
                        ? item.discountedPrice * item.quantity
                        : item.price * item.quantity
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* معلومات الشحن */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-right">عنوان التوصيل</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-right">
          <p className="font-medium">{address.fullName}</p>
          <p>{address.phoneNumber}</p>
          <p>{address.city} {address.street ? ` - ${address.street}` : ''} {address.buildingNumber ? ` - ${address.buildingNumber}` : ''}</p>
          {address.additionalDetails && <p>{address.additionalDetails}</p>}
        </div>
      </div>
      
      {/* معلومات الدفع */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-right">طريقة الدفع</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-right">
          <p className="font-medium">{getPaymentMethodText(paymentMethod)}</p>
          {(paymentMethod === PaymentMethodType.CREDIT_CARD || paymentMethod === PaymentMethodType.MADA) && 
            paymentDetails.cardNumber && (
            <p>
              البطاقة المنتهية بـ **** {getCardLastDigits()}
              {paymentDetails.expiryDate && ` | تنتهي في ${paymentDetails.expiryDate}`}
            </p>
          )}
        </div>
      </div>
      
      {/* ملخص المبالغ */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-right">ملخص الدفع</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>المجموع الأصلي:</span>
            <span>{formatCurrency(originalSubTotal)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>الخصم:</span>
              <span>- {formatCurrency(discountAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between mb-2">
            <span>المجموع بعد الخصم:</span>
            <span>{formatCurrency(subTotal)}</span>
          </div>
          
          <div className="flex justify-between mb-2 text-gray-600">
            <span>ضريبة القيمة المضافة (15%):</span>
            <span>{formatCurrency(vatAmount)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span>رسوم التوصيل:</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          
          <div className="flex justify-between pt-3 mt-3 border-t-2 font-bold text-lg">
            <span>الإجمالي:</span>
            <span className="text-green-600">{formatCurrency(finalAmount)}</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            * الأسعار تشمل ضريبة القيمة المضافة (15%)
          </div>
        </div>
      </div>
      
      {/* الشروط والأحكام */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsAcceptedChange(e.target.checked)}
            className="ml-2"
          />
          <span className="text-sm text-gray-700">
            أوافق على الشروط والأحكام وسياسة الخصوصية
          </span>
        </label>
      </div>
      
      {/* أزرار التنقل */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium transition-colors"
        >
          رجوع
        </button>
        
        <button
          onClick={onSubmit}
          disabled={loading || !termsAccepted}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
        </button>
      </div>
    </div>
  );
};

export default ConfirmOrder;