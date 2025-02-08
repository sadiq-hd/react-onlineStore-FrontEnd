import React, { useState } from 'react';
import { PaymentMethodType, PAYMENT_METHODS, DeliveryAddress } from '../typerScript/order';

interface DeliveryAddressFormProps {
  orderId: number; 
  onSubmit: (address: DeliveryAddress) => void;
  onBack: () => void;
  onNext?: () => void;
}


const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({ orderId, onSubmit, onBack, onNext = () => {} }) => {  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.length > 100 || city.length > 50 || street.length > 100 || 
        (buildingNumber && buildingNumber.length > 20) || 
        (additionalDetails && additionalDetails.length > 200)) {
      alert('الرجاء التحقق من طول البيانات المدخلة');
      return;
    }
  
    if (!/^05\d{8}$/.test(phoneNumber)) {
      alert('رقم الهاتف غير صحيح');
      return;
    }
  
    const address: DeliveryAddress = {
      orderId,
      fullName,
      phoneNumber,
      city,
      street,
      buildingNumber,
      additionalDetails
    };
    
    onSubmit(address);
    onNext();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">أضف عنوان التوصيل</h2>
      <form onSubmit={handleSubmit}>
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
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            رجوع
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            متابعة
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryAddressForm;
