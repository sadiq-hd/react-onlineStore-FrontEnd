import axios, { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  error?: string;
}

export const handleAxiosError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // إذا كان هناك رسالة خطأ من السيرفر
    if (axiosError.response?.data?.message) {
      return new Error(axiosError.response.data.message);
    }
    
    // إذا كان هناك خطأ في الاتصال
    if (axiosError.message === 'Network Error') {
      return new Error('فشل الاتصال بالخادم');
    }

    // الأخطاء الشائعة
    switch (axiosError.response?.status) {
      case 401:
        return new Error('يرجى تسجيل الدخول');
      case 403:
        return new Error('غير مصرح لك بالوصول');
      case 404:
        return new Error('لم يتم العثور على المورد المطلوب');
      case 422:
        return new Error('بيانات غير صالحة');
      case 500:
        return new Error('خطأ في الخادم');
      default:
        return new Error('حدث خطأ غير متوقع');
    }
  }

  // إذا كان الخطأ من نوع آخر
  return new Error('حدث خطأ غير متوقع');
};