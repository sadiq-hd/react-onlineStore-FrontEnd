// src/services/authService.ts
import api, { handleApiError } from '../config/apiConfig';

export const authService = {
  async login(credentials: { emailOrPhone: string; password: string }) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // التحقق مما إذا كان هناك حاجة للتحقق ثنائي العامل
      if (response.data.requireOtp) {
        return response.data; // إرجاع بيانات التحقق
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async verifyOtp(verifyData: { phoneNumber: string; otp: string }) {
    try {
      const response = await api.post('/auth/verify-otp', verifyData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async resendOtp(phoneNumber: string) {
    try {
      const response = await api.post('/auth/resend-otp', { phoneNumber });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
  }) {
    try {
      const response = await api.post('/auth/register', userData);
      
      // التحقق مما إذا كان هناك حاجة للتحقق من رقم الهاتف
      if (response.data.requirePhoneVerification) {
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async verifyPhone(verifyData: { phoneNumber: string; otp: string }) {
    try {
      const response = await api.post('/auth/verify-phone', verifyData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async verifyResetOtp(verifyData: { phoneNumber: string; otp: string }) {
    try {
      const response = await api.post('/auth/verify-reset-otp', verifyData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async resetPassword(resetData: { email: string; token: string; newPassword: string }) {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // التحقق من وجود البريد الإلكتروني
  async checkEmail(email: string) {
    try {
      const response = await api.post('/auth/check-email', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // تحديث الملف الشخصي
  async updateProfile(profileData: {
    name: string;
    email: string;
    phoneNumber?: string;
    verifyNewPhone?: boolean;
  }) {
    try {
      const response = await api.put('/auth/update-profile', profileData);
      
      // التحقق مما إذا كان هناك حاجة للتحقق من رقم الهاتف الجديد
      if (response.data.requirePhoneVerification) {
        return response.data;
      }
      
      // تحديث بيانات المستخدم في التخزين المحلي
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async verifyNewPhone(verifyData: { phoneNumber: string; otp: string }) {
    try {
      const response = await api.post('/auth/verify-new-phone', verifyData);
      
      // تحديث بيانات المستخدم في التخزين المحلي
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // تغيير كلمة المرور
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // تسجيل الخروج
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  // الحصول على المستخدم الحالي
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  },

  // التحقق من حالة تسجيل الدخول
  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  }
};