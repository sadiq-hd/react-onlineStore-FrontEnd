import React from 'react';
import { CartItem } from '../typerScript/cart';
import { DeliveryAddress } from '../typerScript/order';
import { PaymentMethodType } from '../typerScript/order';

interface ConfirmOrderProps {
  cartItems: CartItem[];
  address: DeliveryAddress;
  onAddressChange: (field: keyof DeliveryAddress, value: string) => void;
  subTotal: number;
  discountAmount?: number; // إضافة مبلغ الخصم (اختياري)
  vatAmount: number;
  deliveryFee: number;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethodType | null;
  paymentDetails: Record<string, string>;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
  termsAccepted: boolean;
  onTermsAcceptedChange: (value: boolean) => void;
}

const ConfirmOrder: React.FC<ConfirmOrderProps> = ({
  cartItems,
  address,
  subTotal,
  discountAmount = 0, // قيمة افتراضية صفر
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
  // التحقق من وجود أي خصم
  const hasAnyDiscount = discountAmount > 0;

  // ترجمة طريقة الدفع
  const getPaymentMethodText = (method: PaymentMethodType | null): string => {
    if (!method) return 'غير محدد';
    
    const methodMap: Record<PaymentMethodType, string> = {
      CREDIT_CARD: 'بطاقة ائتمانية',
      MADA: 'مدى',
      APPLE_PAY: 'آبل باي',
      GOOGLE_PAY: 'جوجل باي',
      SAMSUNG_PAY: 'سامسونج باي',
      STC_PAY: 'STC Pay',
      CASH_ON_DELIVERY: 'الدفع عند الاستلام',
      PAYPAL: 'PayPal'
    };
    
    return methodMap[method] || method.toString();
  };

  // عرض آخر 4 أرقام من البطاقة
  const formatCardNumber = (cardNumber: string | undefined): string => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s/g, '');
    return `XXXX XXXX XXXX ${cleaned.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6">تأكيد الطلب</h2>
      
      {/* معلومات العنوان */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">عنوان التوصيل</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p><span className="font-medium">الاسم:</span> {address.fullName}</p>
          <p><span className="font-medium">الجوال:</span> {address.phoneNumber}</p>
          <p><span className="font-medium">المدينة:</span> {address.city}</p>
          <p><span className="font-medium">الشارع:</span> {address.street}</p>
          {address.buildingNumber && (
            <p><span className="font-medium">رقم المبنى:</span> {address.buildingNumber}</p>
          )}
          {address.additionalDetails && (
            <p><span className="font-medium">تفاصيل إضافية:</span> {address.additionalDetails}</p>
          )}
        </div>
      </div>

      {/* معلومات الدفع */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">طريقة الدفع</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p><span className="font-medium">الطريقة:</span> {getPaymentMethodText(paymentMethod)}</p>
          
          {paymentMethod === PaymentMethodType.CREDIT_CARD && (
            <p><span className="font-medium">رقم البطاقة:</span> {formatCardNumber(paymentDetails.cardNumber)}</p>
          )}
          
          {paymentMethod === PaymentMethodType.MADA && (
            <p><span className="font-medium">رقم البطاقة:</span> {formatCardNumber(paymentDetails.cardNumber)}</p>
          )}
          
          {paymentMethod === PaymentMethodType.CASH_ON_DELIVERY && (
            <p className="text-gray-600">سيتم الدفع عند استلام الطلب</p>
          )}
        </div>
      </div>

      {/* ملخص الطلب */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">ملخص الطلب</h3>
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.productId} className="flex justify-between items-center border-b pb-2">
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                
                {/* عرض معلومات الخصم إذا كان متوفرًا */}
                {item.hasDiscount && item.discountedPrice !== undefined && (
                  <div className="text-xs text-green-600">
                    {item.discountType === 'Percentage' 
                      ? `خصم ${item.discountValue}%` 
                      : `خصم ${item.discountValue} ريال`}
                  </div>
                )}
              </div>
              
              <div>
                {/* عرض السعر مع الخصم إذا كان متوفرًا */}
                {item.hasDiscount && item.discountedPrice !== undefined ? (
                  <div className="text-left">
                    <span className="line-through text-gray-500 block text-sm">
                      {item.price.toLocaleString('ar-SA')} ريال
                    </span>
                    <span className="font-medium text-green-600">
                      {item.discountedPrice.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                ) : (
                  <span className="font-medium">
                    {item.price.toLocaleString('ar-SA')} ريال
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ملخص المبالغ */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>المجموع الفرعي:</span>
            <span>{subTotal.toLocaleString('ar-SA')} ريال</span>
          </div>
          
          {/* عرض صف الخصم فقط إذا كان هناك خصم */}
          {hasAnyDiscount && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>إجمالي الخصومات:</span>
              <span>- {discountAmount.toLocaleString('ar-SA')} ريال</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>ضريبة القيمة المضافة (15%):</span>
            <span>{vatAmount.toLocaleString('ar-SA')} ريال</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>رسوم التوصيل:</span>
            <span>{deliveryFee.toLocaleString('ar-SA')} ريال</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center font-bold">
            <span>الإجمالي النهائي:</span>
            <span>{finalAmount.toLocaleString('ar-SA')} ريال</span>
          </div>
        </div>
      </div>

      {/* شروط الخدمة */}
      <div className="mb-6">
        <label className="flex items-center space-x-2 space-x-reverse">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsAcceptedChange(e.target.checked)}
            className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            أوافق على شروط الخدمة وسياسة الخصوصية
          </span>
        </label>
      </div>

      {/* أزرار */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
        <button
          onClick={onBack}
          className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          رجوع
        </button>
        <button
          onClick={onSubmit}
          disabled={!termsAccepted || loading}
          className={`flex-1 py-2 px-4 rounded-lg text-white ${
            !termsAccepted || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <span className="mr-2">جاري إنشاء الطلب...</span>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </>
          ) : (
            'تأكيد الطلب'
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmOrder;