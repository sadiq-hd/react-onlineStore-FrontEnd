// src/services/authService.ts
export const authService = {
  async login(credentials: { email: string; password: string }) {
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
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data;
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

    const updatedUser = await response.json();
    // تحديث بيانات المستخدم في التخزين المحلي
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  },

  // تغيير كلمة المرور
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
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