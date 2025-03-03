import React from 'react';
import { CartItem } from '../typerScript/cart';
import SaudiRiyal from "../assets/Saudi_Riyal.png";

interface OrderSummaryProps {
    cartItems: CartItem[];
    subTotal: number;
    discountAmount?: number; // مبلغ الخصم الإجمالي (اختياري)
    vatAmount: number;
    deliveryFee: number;
    total: number;
    onNext: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
    cartItems, 
    subTotal, 
    discountAmount = 0, // قيمة افتراضية صفر إذا لم يتم تمريرها
    vatAmount, 
    deliveryFee, 
    total, 
    onNext 
}) => {
    // حساب ما إذا كان هناك أي منتج به خصم
    const hasAnyDiscount = cartItems.some(item => item.hasDiscount && item.discountedPrice !== undefined);

    // دالة لتنسيق المبالغ
    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(amount);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>
            <div className="space-y-4">
                {cartItems.map(item => (
                    <div key={item.productId} className="flex justify-between items-center pb-2 border-b">
                        <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                                الكمية: {item.quantity}
                            </p>
                            
                            {/* عرض معلومات الخصم إذا كان متوفرًا */}
                            {item.hasDiscount && item.discountedPrice !== undefined && (
                                <div className="text-xs text-green-600 mt-1">
                                    <span className="line-through text-gray-500 ml-1">{item.price} ريال</span>
                                    {item.discountedPrice} ريال
                                    {item.discountType && item.discountValue && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mr-2">
                                            {item.discountType === 'Percentage' 
                                                ? `${item.discountValue}%` 
                                                : `خصم ${item.discountValue} ريال`}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="text-left">
                            {/* عرض السعر مع الخصم أو بدونه */}
                            {item.hasDiscount && item.discountedPrice !== undefined ? (
                                <div>
                                    <span className="line-through text-gray-500 block text-sm">
                                        {formatCurrency(item.price * item.quantity)}
                                    </span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(item.discountedPrice * item.quantity)}
                                    </span>
                                </div>
                            ) : (
                                <span className="font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                
                <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>المجموع الفرعي</span>
                        <span>{formatCurrency(subTotal)}</span>
                    </div>
                    
                    {/* عرض صف الخصم فقط إذا كان هناك خصم */}
                    {hasAnyDiscount && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span>إجمالي الخصومات</span>
                            <span>- {formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between text-sm text-gray-600">
    <span>ضريبة القيمة المضافة (متضمنة في السعر)</span>
    <span>{formatCurrency(vatAmount)}</span>
</div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>رسوم التوصيل</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center font-bold">
                        <span>الإجمالي النهائي</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
            <button
                onClick={onNext}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
                متابعة للدفع
            </button>
        </div>
    );
};

export default OrderSummary;