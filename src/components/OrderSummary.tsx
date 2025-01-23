import React from 'react';
import { CartItem } from '../typerScript/cart';

interface OrderSummaryProps {
    cartItems: CartItem[];
    subTotal: number;
    vatAmount: number;
    deliveryFee: number;
    total: number;
    onNext: () => void;
  }

  const OrderSummary: React.FC<OrderSummaryProps> = ({ 
    cartItems, 
    subTotal, 
    vatAmount, 
    deliveryFee, 
    total, 
    onNext 
}) => {
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
                    <div key={item.productId} className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                                الكمية: {item.quantity}
                            </p>
                        </div>
                        <span className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                        </span>
                    </div>
                ))}
                
                <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>المجموع الفرعي</span>
                        <span>{formatCurrency(subTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>ضريبة القيمة المضافة (15%)</span>
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