// src/services/authService.ts
export const authService = {
  async login(credentials: { emailOrPhone: string; password: string }) {
    const response = await fetch('https://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    
    // التحقق مما إذا كان هناك حاجة للتحقق ثنائي العامل
    if (data.requireOtp) {
      return data; // إرجاع بيانات التحقق
    }
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data;
  },

  async verifyOtp(verifyData: { phoneNumber: string; otp: string }) {
    const response = await fetch('https://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data;
  },

  async resendOtp(phoneNumber: string) {
    const response = await fetch('https://localhost:5000/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
  }) {
    const response = await fetch('https://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    
    // التحقق مما إذا كان هناك حاجة للتحقق من رقم الهاتف
    if (data.requirePhoneVerification) {
      return data;
    }
    
    return data;
  },

  async verifyPhone(verifyData: { phoneNumber: string; otp: string }) {
    const response = await fetch('https://localhost:5000/api/auth/verify-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data;
  },

  async forgotPassword(email: string) {
    const response = await fetch('https://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },

  async verifyResetOtp(verifyData: { phoneNumber: string; otp: string }) {
    const response = await fetch('https://localhost:5000/api/auth/verify-reset-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },

  async resetPassword(resetData: { email: string; token: string; newPassword: string }) {
    const response = await fetch('https://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resetData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },

  // التحقق من وجود البريد الإلكتروني
  async checkEmail(email: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch('https://localhost:5000/api/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  },

  // تحديث الملف الشخصي
  async updateProfile(profileData: {
    name: string;
    email: string;
    phoneNumber?: string;
    verifyNewPhone?: boolean;
  }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch('https://localhost:5000/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    
    // التحقق مما إذا كان هناك حاجة للتحقق من رقم الهاتف الجديد
    if (data.requirePhoneVerification) {
      return data;
    }
    
    // تحديث بيانات المستخدم في التخزين المحلي
    localStorage.setItem('currentUser', JSON.stringify(data));
    return data;
  },

  async verifyNewPhone(verifyData: { phoneNumber: string; otp: string }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch('https://localhost:5000/api/auth/verify-new-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(verifyData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    // تحديث بيانات المستخدم في التخزين المحلي
    localStorage.setItem('currentUser', JSON.stringify(data));
    return data;
  },

  // تغيير كلمة المرور
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول');
    }

    const response = await fetch('https://localhost:5000/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
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
    return JSON.parse(userStr);
  },

  // التحقق من حالة تسجيل الدخول
  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  }
};