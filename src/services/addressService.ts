// src/services/addressService.ts
import api, { handleApiError } from '../config/apiConfig';
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
    try {
      const response = await api.get('/delivery-addresses');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // إضافة عنوان جديد
  async addAddress(address: Omit<DeliveryAddress, 'id'>): Promise<UserAddress> {
    try {
      const addressData = {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        city: address.city,
        street: address.street,
        buildingNumber: address.buildingNumber,
        additionalDetails: address.additionalDetails,
        isDefault: false // القيمة الافتراضية
      };

      const response = await api.post('/delivery-addresses', addressData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // حذف عنوان
  async deleteAddress(addressId: number): Promise<boolean> {
    try {
      await api.delete(`/delivery-addresses/${addressId}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // تحديث عنوان
  async updateAddress(address: UserAddress): Promise<UserAddress> {
    try {
      const addressData = {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        city: address.city,
        street: address.street,
        buildingNumber: address.buildingNumber,
        additionalDetails: address.additionalDetails,
        isDefault: address.isDefault
      };

      const response = await api.put(`/delivery-addresses/${address.id}`, addressData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // تعيين عنوان كافتراضي
  async setDefaultAddress(addressId: number): Promise<boolean> {
    try {
      await api.put(`/delivery-addresses/${addressId}/set-default`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
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