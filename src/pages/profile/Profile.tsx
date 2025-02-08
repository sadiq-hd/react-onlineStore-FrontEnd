import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../typerScript/useFavorites';
import { orderService } from '../../services/orderService';
import { OrderResponseDto } from '../../typerScript/order';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const [activeTab, setActiveTab] = useState('profile');
  const { state: favoritesState, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders(1, 3); // جلب أول 3 طلبات فقط
      setOrders(response.orders);
    } catch (error) {
      toast.error('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  // التحقق من تسجيل الدخول
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-700">يرجى تسجيل الدخول</p>
        </div>
      </div>
    );
  }

  // دالة إزالة المنتج من المفضلة
  const handleRemoveFromFavorites = async (productId: number) => {
    try {
      await removeFromFavorites(productId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* الشريط الجانبي */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">
                  {currentUser.name[0]}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                <p className="text-gray-500">{currentUser.email}</p>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'profile', label: 'معلوماتي', icon: '👤' },
                  ...(currentUser.role !== 'admin' ? [
                    { name: 'orders', label: 'طلباتي', icon: '🛒' }
                  ] : []),
                  ...(currentUser.role !== 'admin' ? [
                    { name: 'favorites', label: 'المفضلة', icon: '❤️' }
                  ] : []),
                  ...(currentUser.role === 'admin' ? [
                    { name: 'dashboard', label: 'لوحة التحكم', icon: '📊' }
                  ] : [])
                ].map(tab => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`w-full flex items-center justify-start py-3 px-4 rounded-lg transition-all duration-200 ${
                      activeTab === tab.name 
                      ? 'bg-blue-100 text-blue-600 font-bold' 
                      : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="ml-3 text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* قسم الملف الشخصي */}
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">المعلومات الشخصية</h3>
                  <form className="space-y-6">
                    {[
                      { label: 'الاسم', type: 'text', value: currentUser.name },
                      { label: 'البريد الإلكتروني', type: 'email', value: currentUser.email },
                      { label: 'رقم الهاتف', type: 'tel', value: '' }
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                        <input
                          type={field.type}
                          defaultValue={field.value}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                    ))}
                    <button 
                      type="submit" 
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
                    >
                      حفظ التغييرات
                    </button>
                  </form>
                </div>
              )}

              {/* قسم الطلبات */}
              {activeTab === 'orders' && currentUser.role !== 'admin' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">طلباتي</h3>
                    <button
                      onClick={() => navigate('/UserOrders')}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      عرض كل الطلبات
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">لا توجد طلبات حالياً</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.slice(0, 3).map(order => (
                        <div
                          key={order.id}
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-700">طلب #{order.id}</span>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                                orderService.getOrderStatusColor(order.status)
                              }`}>
                                {orderService.getOrderStatusText(order.status)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(order.orderDate).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {order.items.slice(0, 2).map((item) => (
                              <div
                                key={item.productId}
                                className="flex justify-between items-center text-gray-600"
                              >
                                <span>{item.productName} × {item.quantity}</span>
                                <span>{orderService.formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-500">
                                و {order.items.length - 2} منتجات أخرى
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex justify-between items-center pt-4 border-t">
                            <div className="text-sm text-gray-600">
                              {orderService.getPaymentMethodText(order.paymentMethod)}
                            </div>
                            <div className="font-bold text-gray-800">
                              {orderService.formatCurrency(order.finalAmount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* قسم المفضلة */}
              {activeTab === 'favorites' && currentUser.role !== 'admin' && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">المفضلة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritesState.items.map(item => (
                      <div 
                        key={item.id} 
                        className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="font-bold mb-2 text-gray-800">{item.name}</h4>
                          <p className="text-blue-600 font-bold mb-4">
                            {orderService.formatCurrency(item.price)}
                          </p>
                          <button 
                            onClick={() => handleRemoveFromFavorites(item.id)}
                            className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-all"
                          >
                            إزالة من المفضلة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* قسم لوحة التحكم */}
              {activeTab === 'dashboard' && currentUser.role === 'admin' && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">لوحة التحكم</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <button 
                      onClick={() => navigate('/AdminDashboard')}
                      className="w-full bg-purple-50 p-6 rounded-lg text-center hover:shadow-md transition-all cursor-pointer text-purple-700 font-bold text-xl"
                    >
                      الانتقال إلى لوحة التحكم
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;