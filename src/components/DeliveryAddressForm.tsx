import React, { useState, useEffect } from 'react';
import { DeliveryAddress } from '../typerScript/order';
import { addressService } from '../services/addressService';
import { toast } from 'react-toastify';
import { Trash2, Plus, Check, Star, StarOff, Loader2 } from 'lucide-react';

interface UserAddress {
  id: number;
  fullName: string;
  phoneNumber: string;
  city: string;
  street: string;
  buildingNumber?: string;
  additionalDetails?: string;
  isDefault: boolean;
  createdAt: string;
}

interface DeliveryAddressFormProps {
  orderId: number; 
  onSubmit: (address: DeliveryAddress) => void;
  onBack: () => void;
  onNext?: () => void;
}

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({ orderId, onSubmit, onBack, onNext = () => {} }) => {
  // بيانات العنوان الجديد
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // حالة استخدام عنوان محفوظ
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  // حالات التحميل
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingAddress, setIsDeletingAddress] = useState<number | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<number | null>(null);

  // جلب عناوين المستخدم المحفوظة
  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const addresses = await addressService.getUserAddresses();
      setSavedAddresses(addresses);
      
      // إذا كان هناك عنوان افتراضي، اختره تلقائيًا
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addresses.length > 0) {
        // إذا لم يكن هناك عنوان افتراضي، اختر أول عنوان
        setSelectedAddressId(addresses[0].id);
      } else {
        // إذا لم تكن هناك أي عناوين، اختر إضافة عنوان جديد
        setUseSavedAddress(false);
      }
    } catch (error: any) {
      console.error('خطأ في جلب العناوين:', error);
      toast.error(error.message || 'فشل في تحميل العناوين المحفوظة');
      setUseSavedAddress(false);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // عند اختيار عنوان محفوظ
  const handleSelectAddress = (address: UserAddress) => {
    setSelectedAddressId(address.id);
  };

  // حذف عنوان محفوظ
  const handleDeleteAddress = async (addressId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // منع انتشار الحدث لعنصر الأب
    
    if (savedAddresses.length <= 1) {
      toast.warning('لا يمكن حذف جميع العناوين، يجب أن يكون هناك عنوان واحد على الأقل');
      return;
    }
    
    try {
      setIsDeletingAddress(addressId);
      await addressService.deleteAddress(addressId);
      setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast.success('تم حذف العنوان بنجاح');
      
      // إذا كان العنوان المحذوف هو المحدد حاليًا
      if (selectedAddressId === addressId) {
        // اختر عنوانًا آخر (الافتراضي إن وجد، أو الأول)
        const remainingAddresses = savedAddresses.filter(addr => addr.id !== addressId);
        const nextDefaultAddress = remainingAddresses.find(addr => addr.isDefault);
        setSelectedAddressId(nextDefaultAddress?.id || (remainingAddresses[0]?.id || null));
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في حذف العنوان');
    } finally {
      setIsDeletingAddress(null);
    }
  };

  // تعيين عنوان كافتراضي
  const handleSetDefaultAddress = async (addressId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // منع انتشار الحدث لعنصر الأب
    
    try {
      setIsSettingDefault(addressId);
      // تقديم طلب لتعيين العنوان كافتراضي - أنشئ هذه الدالة في addressService
      const isSuccess = await addressService.setDefaultAddress(addressId);
      
      if (isSuccess) {
        // تحديث حالة العناوين محليًا
        setSavedAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        })));
        
        toast.success('تم تعيين العنوان الافتراضي بنجاح');
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في تعيين العنوان الافتراضي');
    } finally {
      setIsSettingDefault(null);
    }
  };

 

// تقديم النموذج
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // في حالة استخدام عنوان محفوظ
  if (useSavedAddress) {
    if (!selectedAddressId) {
      toast.error('الرجاء اختيار عنوان من القائمة');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        // تحويل عنوان المستخدم إلى عنوان توصيل للطلب
        const deliveryAddress: DeliveryAddress = {
          id: 0, // سيتم تعيينه من قبل الباكيند
          orderId,
          fullName: selectedAddress.fullName,
          phoneNumber: selectedAddress.phoneNumber,
          city: selectedAddress.city,
          street: selectedAddress.street,
          buildingNumber: selectedAddress.buildingNumber,
          additionalDetails: selectedAddress.additionalDetails
        };
        
        onSubmit(deliveryAddress);
        onNext();
      }
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء تقديم العنوان');
    } finally {
      setIsSubmitting(false);
    }
  } else {
    // في حالة إضافة عنوان جديد
    if (fullName.length > 100 || city.length > 50 || street.length > 100 || 
        (buildingNumber && buildingNumber.length > 20) || 
        (additionalDetails && additionalDetails.length > 200)) {
      toast.error('الرجاء التحقق من طول البيانات المدخلة');
      return;
    }
  
    if (!/^05\d{8}$/.test(phoneNumber)) {
      toast.error('رقم الهاتف غير صحيح');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const newAddressData = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        city: city.trim(),
        street: street.trim(),
        buildingNumber: buildingNumber?.trim(),
        additionalDetails: additionalDetails?.trim(),
        isDefault: isDefault // هنا نضيف خيار الافتراضي
      };
      
      // إذا كان المستخدم يريد حفظ العنوان لاستخدامه في المستقبل
      if (isDefault) {
        // حفظ العنوان في قاعدة البيانات
        const savedAddress = await addressService.addAddress({
          ...newAddressData,
          orderId
        });
        
        // تحديث قائمة العناوين المحفوظة
        setSavedAddresses(prev => [
          ...prev.map(addr => ({ ...addr, isDefault: false })), // تحديث الحالة الافتراضية للعناوين الأخرى
          savedAddress
        ]);
        
        toast.success('تم إضافة وحفظ العنوان بنجاح');
      }
      
      // في جميع الحالات، استخدم العنوان الجديد للطلب الحالي
      const deliveryAddress: DeliveryAddress = {
        id: 0,
        orderId,
        fullName: newAddressData.fullName,
        phoneNumber: newAddressData.phoneNumber,
        city: newAddressData.city,
        street: newAddressData.street,
        buildingNumber: newAddressData.buildingNumber,
        additionalDetails: newAddressData.additionalDetails
      };
      
      onSubmit(deliveryAddress);
      onNext();
      
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء تقديم العنوان');
    } finally {
      setIsSubmitting(false);
    }
  }
};

  // تبديل بين إدخال عنوان جديد واستخدام عنوان محفوظ
  const toggleAddressMode = (useExisting: boolean) => {
    setUseSavedAddress(useExisting);
    if (!useExisting) {
      setSelectedAddressId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">عنوان التوصيل</h2>
      
      {/* خيارات العناوين */}
      <div className="mb-6 flex space-x-4 space-x-reverse">
        <button
          type="button"
          onClick={() => toggleAddressMode(false)}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            !useSavedAddress 
              ? 'bg-blue-100 text-blue-700 font-medium border-2 border-blue-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          إضافة عنوان جديد
        </button>
        <button
          type="button"
          onClick={() => toggleAddressMode(true)}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            useSavedAddress 
              ? 'bg-blue-100 text-blue-700 font-medium border-2 border-blue-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
          disabled={savedAddresses.length === 0}
        >
          استخدام عنوان محفوظ
        </button>
      </div>
      
      {/* عرض العناوين المحفوظة */}
      {useSavedAddress && (
        <div className="mb-6">
          {isLoadingAddresses ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">جاري تحميل العناوين...</p>
            </div>
          ) : savedAddresses.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">لا توجد عناوين محفوظة</p>
              <button
                type="button"
                onClick={() => toggleAddressMode(false)}
                className="mt-2 text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
              >
                <Plus size={16} />
                إضافة عنوان جديد
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {savedAddresses.map(address => (
                <div
                  key={address.id}
                  onClick={() => handleSelectAddress(address)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                    selectedAddressId === address.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{address.fullName}</div>
                    <div className="flex items-center gap-2">
                      {selectedAddressId === address.id && (
                        <div className="text-blue-600">
                          <Check size={18} />
                        </div>
                      )}
                    </div>
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
                  <div className="absolute top-2 left-2 flex gap-1">
                    {/* زر تعيين كافتراضي */}
                    <button
                      type="button"
                      onClick={(e) => handleSetDefaultAddress(address.id, e)}
                      className={`p-1 rounded-full ${address.isDefault ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'} transition-colors`}
                      title={address.isDefault ? "عنوان افتراضي" : "تعيين كعنوان افتراضي"}
                      disabled={isSettingDefault === address.id || address.isDefault}
                    >
                      {isSettingDefault === address.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : address.isDefault ? (
                        <Star size={16} />
                      ) : (
                        <StarOff size={16} />
                      )}
                    </button>
                    
                    
                    {/* زر الحذف */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAddress(address.id, e)}
                      className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="حذف العنوان"
                      disabled={isDeletingAddress === address.id}
                    >
                      {isDeletingAddress === address.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                  
                  {/* شارة الافتراضي */}
                  {address.isDefault && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
                      افتراضي
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* نموذج إضافة عنوان جديد */}
      {!useSavedAddress && (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-medium mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-medium mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="05xxxxxxxx"
            />
            <p className="text-xs text-gray-500 mt-1">يجب أن يبدأ الرقم بـ 05 ويتكون من 10 أرقام</p>
          </div>
          <div className="mb-4">
            <label htmlFor="city" className="block text-gray-700 text-sm font-medium mb-2">
              المدينة
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="street" className="block text-gray-700 text-sm font-medium mb-2">
              الشارع
            </label>
            <input
              type="text"
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="buildingNumber" className="block text-gray-700 text-sm font-medium mb-2">
              رقم المبنى
            </label>
            <input
              type="text"
              id="buildingNumber"
              value={buildingNumber}
              onChange={(e) => setBuildingNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="additionalDetails" className="block text-gray-700 text-sm font-medium mb-2">
              تفاصيل إضافية
            </label>
            <textarea
              id="additionalDetails"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="mr-2 text-gray-700">حفظ العنوان واستخدامه للطلبات المستقبلية</span>
            </label>
          </div>
        </form>
      )}
      
      {/* أزرار التنقل */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          رجوع
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
          disabled={useSavedAddress && !selectedAddressId || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            'متابعة'
          )}
        </button>
      </div>
    </div>
  );
};

export default DeliveryAddressForm;