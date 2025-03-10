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

    // دالة لتنسيق المبالغ (بدون رمز العملة لأننا سنستخدم الصورة)
    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('ar-SA', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);

    // تم حذف مكون PriceWithRiyal لأنه غير مستخدم

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
                                    <span className="line-through text-gray-500 ml-1 flex items-center">
                                        {item.price} <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                                    </span>
                                    <span className="flex items-center">
                                        {item.discountedPrice} <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                                    </span>
                                    {item.discountType && item.discountValue && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mr-2">
                                            {item.discountType === 'Percentage' 
                                                ? `${item.discountValue}%` 
                                                : `خصم ${item.discountValue} `}
                                            {item.discountType !== 'Percentage' && (
                                                <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 inline" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="text-left">
                            {/* عرض السعر مع الخصم أو بدونه */}
                            {item.hasDiscount && item.discountedPrice !== undefined ? (
                                <div>
                                    <div className="line-through text-gray-500 text-sm flex justify-end items-center">
                                        {formatCurrency(item.price * item.quantity)}
                                        <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                                    </div>
                                    <div className="font-medium text-green-600 flex justify-end items-center">
                                        {formatCurrency(item.discountedPrice * item.quantity)}
                                        <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                                    </div>
                                </div>
                            ) : (
                                <div className="font-medium flex justify-end items-center">
                                    {formatCurrency(item.price * item.quantity)}
                                    <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>المجموع الفرعي</span>
                        <div className="flex items-center">
                            {formatCurrency(subTotal)}
                            <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                        </div>
                    </div>
                    
                    {/* عرض صف الخصم فقط إذا كان هناك خصم */}
                    {hasAnyDiscount && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span>إجمالي الخصومات</span>
                            <div className="flex items-center">
                                - {formatCurrency(discountAmount)}
                                <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>ضريبة القيمة المضافة (متضمنة في السعر)</span>
                        <div className="flex items-center">
                            {formatCurrency(vatAmount)}
                            <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                        </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>رسوم التوصيل</span>
                        <div className="flex items-center">
                            {formatCurrency(deliveryFee)}
                            <img src={SaudiRiyal} alt="ريال سعودي" className="w-3 h-3 mr-1" />
                        </div>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center font-bold">
                        <span>الإجمالي النهائي</span>
                        <div className="flex items-center">
                            {formatCurrency(total)}
                            <img src={SaudiRiyal} alt="ريال سعودي" className="w-4 h-4 mr-1" />
                        </div>
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