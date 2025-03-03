import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import SaudiRiyal from "../assets/Saudi_Riyal.png";

const Cart: React.FC = () => {
  const { state, removeFromCart, addToCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId: number, currentQuantity: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (newQuantity > currentQuantity) {
      await addToCart(productId, newQuantity - currentQuantity);
    } else {
      await removeFromCart(productId, currentQuantity - newQuantity);
    }
  };

  const handleRemoveItem = async (productId: number, quantity: number) => {
    await removeFromCart(productId, quantity);
  };

  // حساب المجموع الفرعي مع مراعاة الخصومات
  const calculateSubtotal = () => {
    return state.items.reduce((total, item) => {
      // استخدام السعر بعد الخصم إذا كان متوفراً، وإلا استخدام السعر العادي
      const priceToUse = item.hasDiscount && item.discountedPrice !== undefined ? item.discountedPrice : item.price;
      return total + (priceToUse * item.quantity);
    }, 0);
  };

// التعديل المطلوب في ملف Cart.tsx
const subTotal = Number(calculateSubtotal().toFixed(2));
const vatAmount = Number((subTotal * 0.15 / 1.15).toFixed(2));
const shippingFee = 25;
const finalAmount = Number((subTotal + shippingFee).toFixed(2));

  // حساب إجمالي الخصم
  const totalDiscount = state.items.reduce((total, item) => {
    if (item.hasDiscount && item.discountedPrice !== undefined) {
      return total + ((item.price - item.discountedPrice) * item.quantity);
    }
    return total;
  }, 0);

  // معرفة ما إذا كان هناك أي خصم مطبق
  const hasAnyDiscount = totalDiscount > 0;

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">السلة فارغة</h2>
          <p className="text-gray-600 mb-8">لم تقم بإضافة أي منتجات إلى السلة بعد</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">سلة التسوق</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {state.items.map(item => (
              <div key={item.productId} className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <div className="flex-1 mx-4">
                  <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                  
                  {/* عرض السعر مع الخصم إذا كان متوفراً */}
                  {item.hasDiscount && item.discountedPrice !== undefined ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-gray-500 line-through text-sm">
                        <span>{item.price.toLocaleString('ar-SA')}</span>
                        <img src={SaudiRiyal} alt="SAR" className="w-4 h-4" />
                      </div>
                      
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <span>{item.discountedPrice.toLocaleString('ar-SA')}</span>
                        <img src={SaudiRiyal} alt="SAR" className="w-5 h-5" />
                        
                        {/* عرض نسبة الخصم إذا كانت متوفرة */}
                        {item.discountValue && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mx-1">
                            {item.discountType === 'Percentage' 
                              ? `${item.discountValue}%` 
                              : `خصم ${item.discountValue} ريال`}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-600">
                      <span className="font-semibold">{item.price.toLocaleString('ar-SA')}</span>
                      <img src={SaudiRiyal} alt="SAR" className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity, item.quantity - 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity, item.quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveItem(item.productId, item.quantity)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ملخص الطلب</h2>
  
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>عدد المنتجات</span>
                <span>{state.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
  <span>المجموع (شامل الضريبة)</span>
  <div className="flex items-center gap-1">
    <span>{subTotal.toLocaleString('ar-SA')}</span>
    <img src={SaudiRiyal} alt="SAR" className="w-5 h-5" />
  </div>
</div>
              
              {/* عرض إجمالي مبلغ الخصم إذا كان هناك أي خصم */}
              {hasAnyDiscount && (
                <div className="flex justify-between text-gray-600">
                <span>منها ضريبة القيمة المضافة (15%)</span>
                <div className="flex items-center gap-1">
                  <span>{vatAmount.toLocaleString('ar-SA')}</span>
                  <img src={SaudiRiyal} alt="SAR" className="w-5 h-5" />
                </div>
              </div>
              )}
              
              
              <div className="flex justify-between text-gray-600">
                <span>تكلفة الشحن</span>
                <span className="flex items-center gap-1">
                  <span>25</span>
                  <img src={SaudiRiyal} alt="SAR" className="w-5 h-5 inline-block" />
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>الإجمالي النهائي</span>
                  <div className="flex items-center gap-1">
                    <span>{finalAmount.toLocaleString('ar-SA')}</span>
                    <img src={SaudiRiyal} alt="SAR" className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إتمام الشراء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;