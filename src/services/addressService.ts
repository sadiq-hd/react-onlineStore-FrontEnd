// src/services/addressService.ts
import { DeliveryAddress } from '../typerScript/order';

export interface UserAddress {
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

export const addressService = {
  // الحصول على عناوين المستخدم
  async getUserAddresses(): Promise<UserAddress[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch('https://localhost:5000/api/delivery-addresses', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },

  // إضافة عنوان جديد
  async addAddress(address: Omit<DeliveryAddress, 'id'>): Promise<UserAddress> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch('https://localhost:5000/api/delivery-addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        city: address.city,
        street: address.street,
        buildingNumber: address.buildingNumber,
        additionalDetails: address.additionalDetails,
        isDefault: false // القيمة الافتراضية
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },

  // حذف عنوان
  async deleteAddress(addressId: number): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch(`https://localhost:5000/api/delivery-addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return true;
  },

  // تحديث عنوان
  async updateAddress(address: UserAddress): Promise<UserAddress> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch(`https://localhost:5000/api/delivery-addresses/${address.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        city: address.city,
        street: address.street,
        buildingNumber: address.buildingNumber,
        additionalDetails: address.additionalDetails,
        isDefault: address.isDefault
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },
  
  // تعيين عنوان كافتراضي
  async setDefaultAddress(addressId: number): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch(`https://localhost:5000/api/delivery-addresses/${addressId}/set-default`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return true;
  },
  
  // تحويل عنوان مستخدم إلى عنوان توصيل للطلب
  convertToDeliveryAddress(userAddress: UserAddress, orderId: number): DeliveryAddress {
    return {
      id: 0, // سيتم تعيينه من قبل الباكيند
      orderId,
      fullName: userAddress.fullName,
      phoneNumber: userAddress.phoneNumber,
      city: userAddress.city,
      street: userAddress.street,
      buildingNumber: userAddress.buildingNumber,
      additionalDetails: userAddress.additionalDetails
    };
  }
};