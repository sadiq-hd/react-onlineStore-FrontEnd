import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../typerScript/useFavorites';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/authService';
import { OrderResponseDto } from '../../typerScript/order';
import { ArrowLeft, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { addressService, UserAddress } from '../../services/addressService';
import { Plus, MapPin, Trash2, Star, Loader2 } from 'lucide-react';

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser') || 'null'));
  const [activeTab, setActiveTab] = useState('profile');
  const { state: favoritesState, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  // حالات العناوين
const [addresses, setAddresses] = useState<UserAddress[]>([]);
const [addressesLoading, setAddressesLoading] = useState(false);
const [addressFormOpen, setAddressFormOpen] = useState(false);
const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
const isUser = currentUser && !currentUser.roles?.includes('admin');

// نموذج العنوان
const [addressForm, setAddressForm] = useState({
  fullName: '',
  phoneNumber: '',
  city: '',
  street: '',
  buildingNumber: '',
  additionalDetails: '',
  isDefault: false
});
  // بيانات الملف الشخصي
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || ''
  });
  
  // بيانات تغيير كلمة المرور
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // حالة تحميل النماذج
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // حالة إظهار كلمة المرور
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    // تحديث بيانات النموذج عند تغير المستخدم
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || ''
      });
    }
  }, [currentUser]);

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

  // جلب العناوين
const fetchAddresses = async () => {
  try {
    setAddressesLoading(true);
    const userAddresses = await addressService.getUserAddresses();
    setAddresses(userAddresses);
  } catch (error: any) {
    toast.error(error.message || 'فشل في تحميل العناوين');
  } finally {
    setAddressesLoading(false);
  }
};

// استدعاء دالة جلب العناوين عند فتح قسم العناوين
useEffect(() => {
  if (activeTab === 'addresses') {
    fetchAddresses();
  }
}, [activeTab]);

// إعادة تعيين نموذج العنوان
const resetAddressForm = () => {
  setAddressForm({
    fullName: '',
    phoneNumber: '',
    city: '',
    street: '',
    buildingNumber: '',
    additionalDetails: '',
    isDefault: false
  });
  setEditingAddress(null);
};

// فتح نموذج تعديل العنوان
const handleEditAddress = (address: UserAddress) => {
  setEditingAddress(address);
  setAddressForm({
    fullName: address.fullName,
    phoneNumber: address.phoneNumber,
    city: address.city,
    street: address.street,
    buildingNumber: address.buildingNumber || '',
    additionalDetails: address.additionalDetails || '',
    isDefault: address.isDefault
  });
  setAddressFormOpen(true);
};

// حذف العنوان
const handleDeleteAddress = async (addressId: number) => {
  try {
    setDeletingAddressId(addressId);
    await addressService.deleteAddress(addressId);
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    toast.success('تم حذف العنوان بنجاح');
  } catch (error: any) {
    toast.error(error.message || 'فشل في حذف العنوان');
  } finally {
    setDeletingAddressId(null);
  }
};

// تعيين العنوان الافتراضي
const handleSetDefaultAddress = async (addressId: number) => {
  try {
    setSettingDefaultId(addressId);
    await addressService.setDefaultAddress(addressId);
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
    toast.success('تم تعيين العنوان الافتراضي بنجاح');
  } catch (error: any) {
    toast.error(error.message || 'فشل في تعيين العنوان الافتراضي');
  } finally {
    setSettingDefaultId(null);
  }
};

// تقديم نموذج العنوان (إضافة/تعديل)
const handleAddressFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!/^05\d{8}$/.test(addressForm.phoneNumber)) {
    toast.error('رقم الهاتف غير صحيح');
    return;
  }
  
  try {
    if (editingAddress) {
      // Actualizar dirección existente
      const updatedAddress = await addressService.updateAddress({
        ...editingAddress,
        fullName: addressForm.fullName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        city: addressForm.city.trim(),
        street: addressForm.street.trim(),
        buildingNumber: addressForm.buildingNumber?.trim(),
        additionalDetails: addressForm.additionalDetails?.trim(),
        isDefault: addressForm.isDefault
      });
      
      setAddresses(prev => prev.map(addr => 
        addr.id === updatedAddress.id 
          ? updatedAddress 
          : addressForm.isDefault ? { ...addr, isDefault: false } : addr
      ));
      
      toast.success('تم تحديث العنوان بنجاح');
    } else {
      // Agregar dirección nueva
      // MODIFICACIÓN: Separar las propiedades válidas del tipo DeliveryAddress de la propiedad isDefault
      const addressData = {
        fullName: addressForm.fullName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        city: addressForm.city.trim(),
        street: addressForm.street.trim(),
        buildingNumber: addressForm.buildingNumber?.trim(),
        additionalDetails: addressForm.additionalDetails?.trim(),
        orderId: 0 // valor placeholder
      };
      
      // Guardar si la dirección es predeterminada para usarla después
      const isDefault = addressForm.isDefault;
      
      // Llamar a addAddress solo con las propiedades compatibles
      const newAddress = await addressService.addAddress(addressData);
      
      // Si se debe establecer como predeterminada, hacerlo en una llamada separada
      if (isDefault) {
        await addressService.setDefaultAddress(newAddress.id);
        newAddress.isDefault = true;
        
        setAddresses(prev => [
          ...prev.map(addr => ({ ...addr, isDefault: false })),
          newAddress
        ]);
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }
      
      toast.success('تم إضافة العنوان بنجاح');
    }
    
    resetAddressForm();
    setAddressFormOpen(false);
  } catch (error: any) {
    toast.error(error.message || 'فشل في حفظ العنوان');
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
  
  // دالة تحديث الملف الشخصي
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      
      // التحقق من البريد الإلكتروني إذا تم تغييره
      if (profileData.email !== currentUser.email) {
        const emailCheck = await authService.checkEmail(profileData.email);
        if (emailCheck.exists) {
          toast.error('البريد الإلكتروني مستخدم بالفعل');
          return;
        }
      }
      
      // تحديث البيانات
      const updatedUser = await authService.updateProfile(profileData);
      setCurrentUser(updatedUser);
      toast.success('تم تحديث البيانات بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل في تحديث البيانات');
    } finally {
      setProfileLoading(false);
    }
  };
  
  // دالة تغيير كلمة المرور
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من تطابق كلمتي المرور
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    
    try {
      setPasswordLoading(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      // إعادة تعيين نموذج كلمة المرور
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('تم تغيير كلمة المرور بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل في تغيير كلمة المرور');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // دالة تبديل إظهار كلمة المرور
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
                  { name: 'addresses', label: 'عناويني', icon: '📍' },

                  { name: 'password', label: 'تغيير كلمة المرور', icon: '🔑' },
                  ...(currentUser.roles?.includes('admin') ? [] : [
                    { name: 'orders', label: 'طلباتي', icon: '🛒' }
                  ]),
                  ...(currentUser.roles?.includes('admin') ? [] : [
                    { name: 'favorites', label: 'المفضلة', icon: '❤️' }
                  ]),
                  ...(currentUser.roles?.includes('admin') ? [
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
                  <form className="space-y-6" onSubmit={handleProfileUpdate}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={profileLoading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex justify-center items-center"
                    >
                      {profileLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        'حفظ التغييرات'
                      )}
                    </button>
                  </form>
                </div>
              )}

{activeTab === 'addresses' && (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-bold text-gray-800">عناويني</h3>
      {!addressFormOpen && (
        <button
          onClick={() => {
            resetAddressForm();
            setAddressFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة عنوان جديد
        </button>
      )}
    </div>
    
    {addressFormOpen ? (
      <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
        <h4 className="text-lg font-bold mb-4">
          {editingAddress ? 'تعديل عنوان' : 'إضافة عنوان جديد'}
        </h4>
        <form onSubmit={handleAddressFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={addressForm.phoneNumber}
                onChange={(e) => setAddressForm({...addressForm, phoneNumber: e.target.value})}
                required
                placeholder="05xxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">يجب أن يبدأ الرقم بـ 05 ويتكون من 10 أرقام</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المدينة
            </label>
            <input
              type="text"
              value={addressForm.city}
              onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الشارع
            </label>
            <input
              type="text"
              value={addressForm.street}
              onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم المبنى
              </label>
              <input
                type="text"
                value={addressForm.buildingNumber}
                onChange={(e) => setAddressForm({...addressForm, buildingNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تفاصيل إضافية
            </label>
            <textarea
              value={addressForm.additionalDetails}
              onChange={(e) => setAddressForm({...addressForm, additionalDetails: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="mr-2 text-gray-700">عنوان افتراضي</span>
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                resetAddressForm();
                setAddressFormOpen(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              {editingAddress ? 'حفظ التعديلات' : 'إضافة العنوان'}
            </button>
          </div>
        </form>
      </div>
    ) : addressesLoading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ) : addresses.length === 0 ? (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 mb-4">لا توجد عناوين محفوظة</p>
        <button
          onClick={() => {
            resetAddressForm();
            setAddressFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة عنوان جديد
        </button>
      </div>
    ) : (
      <div className="space-y-4">
        {addresses.map(address => (
          <div 
            key={address.id}
            className={`border rounded-lg p-4 relative ${
              address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between">
              <div className="font-medium">{address.fullName}</div>
            </div>
            <div className="text-gray-600 text-sm mt-1">{address.phoneNumber}</div>
            <div className="text-gray-700 mt-1">
              {address.city}، {address.street}
              {address.buildingNumber ? `، مبنى ${address.buildingNumber}` : ''}
            </div>
            {address.additionalDetails && (
              <div className="text-gray-500 text-sm mt-1">{address.additionalDetails}</div>
            )}
            
            {/* أزرار العمليات */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => handleEditAddress(address)}
                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                تعديل
              </button>
              
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefaultAddress(address.id)}
                  disabled={settingDefaultId === address.id}
                  className="px-3 py-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors inline-flex items-center"
                >
                  {settingDefaultId === address.id ? (
                    <Loader2 size={14} className="ml-1 animate-spin" />
                  ) : (
                    <Star size={14} className="ml-1" />
                  )}
                  تعيين كافتراضي
                </button>
              )}
              
              <button
                onClick={() => handleDeleteAddress(address.id)}
                disabled={deletingAddressId === address.id}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors inline-flex items-center"
              >
                {deletingAddressId === address.id ? (
                  <Loader2 size={14} className="ml-1 animate-spin" />
                ) : (
                  <Trash2 size={14} className="ml-1" />
                )}
                حذف
              </button>
            </div>
            
            {/* شارة الافتراضي */}
            {address.isDefault && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
                افتراضي
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
              
              {/* قسم تغيير كلمة المرور */}
              {activeTab === 'password' && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">تغيير كلمة المرور</h3>
                  <form className="space-y-6" onSubmit={handlePasswordChange}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => togglePasswordVisibility('current')} 
                          className="absolute right-3 top-2.5 text-gray-500"
                        >
                          {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                          minLength={6}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-2.5 text-gray-500"
                        >
                          {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">يجب أن تكون كلمة المرور على الأقل 6 أحرف</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-2.5 text-gray-500"
                        >
                          {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={passwordLoading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex justify-center items-center"
                    >
                      {passwordLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        'تغيير كلمة المرور'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* قسم الطلبات */}
              {activeTab === 'orders' && !currentUser.roles?.includes('admin') && (
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
              {activeTab === 'favorites' && !currentUser.roles?.includes('admin') && (
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
              {activeTab === 'dashboard' && currentUser.roles?.includes('admin') && (
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