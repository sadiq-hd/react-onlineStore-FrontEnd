// src/components/OrderSummary.tsx
import React from 'react';
import { CartItem } from '../typerScript/cart';
import { formatCurrency } from '../typerScript/order';

interface OrderSummaryProps {
  cartItems: CartItem[];
  originalSubTotal: number;  // مجموع السعر الأصلي قبل الخصم
  subTotal: number;         // المجموع بعد الخصم (يتضمن الضريبة)
  discountAmount: number;   // إجمالي قيمة الخصم
  vatAmount: number;        // قيمة الضريبة المضمنة في السعر
  deliveryFee: number;      // رسوم التوصيل
  total: number;            // المبلغ الإجمالي
  onNext: () => void;       // للانتقال للخطوة التالية
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  originalSubTotal,
  subTotal,
  discountAmount,
  vatAmount,
  deliveryFee,
  total,
  onNext
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">ملخص الطلب</h2>
      
      {/* جدول المنتجات */}
      <div className="overflow-x-auto mb-6">
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
              <tr key={item.productId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{item.name}</td>
                <td className="py-3 px-4">{item.quantity}</td>
                <td className="py-3 px-4">
                  {item.hasDiscount && item.discountedPrice !== undefined
                    ? formatCurrency(item.price)
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
      
      {/* ملخص المبالغ */}
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
          <span className="text-green-600">{formatCurrency(total)}</span>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          * الأسعار تشمل ضريبة القيمة المضافة (15%)
        </div>
      </div>
      
      <div className="mt-6 text-left">
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          متابعة الطلب
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;