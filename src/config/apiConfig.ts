// src/config/apiConfig.ts
import axios from 'axios';

// إعدادات API
export const API_CONFIG = {
  // عنوان API الأساسي
  // BASE_URL: 'https://reactonlinestore-app-h5atcvhec8dcd0da.eastasia-01.azurewebsites.net/api',
  BASE_URL: 'http://localhost:5000/api',

  // عنوان الصور (إذا كان مختلفاً)
  // IMAGE_URL: 'https://reactonlinestore-app-h5atcvhec8dcd0da.eastasia-01.azurewebsites.net',
  IMAGE_URL: 'http://localhost:5000',

  
  // صورة بديلة
  FALLBACK_IMAGE: 'https://via.placeholder.com/200x200?text=صورة+غير+متوفرة',
  

  // مهلة الطلب بالمللي ثانية (10 ثوان)
  TIMEOUT: 10000
};

// إنشاء مثيل أساسي من axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// اعتراض الطلبات لإضافة رمز المصادقة
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// معالج الأخطاء العام
export const handleApiError = (error: any): Error => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // الخادم استجاب بحالة خطأ
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data;
      
      if (status === 401) {
        return new Error('الرجاء تسجيل الدخول مرة أخرى');
      } else if (status === 403) {
        return new Error('ليس لديك صلاحية للوصول إلى هذا المورد');
      } else if (status === 404) {
        return new Error('لم يتم العثور على المورد المطلوب');
      } else if (status === 400) {
        return new Error(typeof message === 'string' ? message : 'بيانات غير صحيحة');
      } else {
        return new Error(`حدث خطأ: ${typeof message === 'string' ? message : 'خطأ غير معروف'}`);
      }
    } else if (error.request) {
      // لم يتم استلام استجابة من الخادم
      return new Error('فشل الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
    } else {
      // خطأ في إعداد الطلب
      return new Error(`حدث خطأ في الطلب: ${error.message}`);
    }
  }
  
  // أخطاء أخرى
  return error instanceof Error ? error : new Error('حدث خطأ غير متوقع');
};

// دالة مساعدة لتنسيق مسارات الصور
export const formatImageUrl = (imageUrl: string): string => {
  if (!imageUrl) {
    return API_CONFIG.FALLBACK_IMAGE;
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // تنظيف وتنسيق المسار
  const cleanPath = imageUrl
    .replace(/^\/+/, '')
    .replace(/^images\//, '')
    .replace(/^api\/images\//, '');

  return `${API_CONFIG.IMAGE_URL}/images/${cleanPath}`;
};

export default api;