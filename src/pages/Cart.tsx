import React from 'react';
import { useCart } from '../context/CartContext';
import { Link , useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { state, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId: number, currentQuantity: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (newQuantity > currentQuantity) {
      // Adding items
      await addToCart(productId, newQuantity - currentQuantity);
    } else {
      // Removing items
      await removeFromCart(productId, currentQuantity - newQuantity);
    }
  };

  const handleRemoveItem = async (productId: number, quantity: number) => {
    await removeFromCart(productId, quantity);
  };

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
                  <p className="text-gray-600">
                    {new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR'
                    }).format(item.price)}
                  </p>
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
      <span>المجموع الفرعي</span>
      <span>{new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
      }).format(state.total)}</span>
    </div>
    <div className="flex justify-between text-gray-600">
      <span>ضريبة القيمة المضافة (15%)</span>
      <span>{new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
      }).format(state.total * 0.15)}</span>
    </div>
    <div className="flex justify-between text-gray-600">
      <span>تكلفة الشحن</span>
      <span>25 ريال</span>
    </div>
    <div className="border-t pt-3">
      <div className="flex justify-between font-semibold text-lg">
        <span>الإجمالي النهائي</span>
        <span>{new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR'
        }).format(state.total * 1.15 + 25)}</span>
      </div>
    </div>
  </div>

  <button 
    onClick={() => navigate('/checkout')}
    disabled={state.loading || state.items.length === 0}
    className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors
      ${(state.loading || state.items.length === 0) 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-blue-700'}`}
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