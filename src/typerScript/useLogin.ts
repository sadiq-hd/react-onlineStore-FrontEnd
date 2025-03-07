// src/hooks/useLogin.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  emailOrPhone: string;  // حقل واحد للإيميل أو الهاتف
  password: string;
}

interface OtpFormData {
  otp: string;
  phoneNumber: string;
}

const API_BASE_URL = 'https://localhost:5000/api';
// const API_BASE_URL = 'https://reactbackend20241214202555.azurewebsites.net';

export const useLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrPhone: '',
    password: ''
  });

  const [otpFormData, setOtpFormData] = useState<OtpFormData>({
    otp: '',
    phoneNumber: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requireOtp, setRequireOtp] = useState(false);
  const [testOtp, setTestOtp] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: otpFormData.phoneNumber
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'حدث خطأ أثناء إعادة إرسال رمز التحقق');
      }

      const data = await response.json();
      
      if (data.testOtp) {
        setTestOtp(data.testOtp);
      }
      
      // عرض رسالة نجاح
      alert(data.message || 'تم إرسال رمز التحقق بنجاح');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إعادة إرسال رمز التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone.trim(),
          password: formData.password
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/problem+json")) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.emailOrPhone?.[0] || errorData.title || 'حدث خطأ في تسجيل الدخول');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'حدث خطأ أثناء تسجيل الدخول');
        }
      }

      const data = await response.json();
      
      // التحقق مما إذا كان هناك حاجة للتحقق ثنائي العامل OTP
      if (data.requireOtp) {
        setRequireOtp(true);
        setOtpFormData(prev => ({
          ...prev,
          phoneNumber: data.phoneNumber || ''
        }));
        
        // حفظ OTP للاختبار في بيئة التطوير فقط
        if (data.testOtp) {
          setTestOtp(data.testOtp);
        }
      } else {
        // حفظ بيانات تسجيل الدخول والتوجيه
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        if (data.user.role === 'admin') {
          navigate('/admin/AdminDashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: otpFormData.phoneNumber,
          otp: otpFormData.otp
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'رمز التحقق غير صحيح');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin/AdminDashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحقق من الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    otpFormData,
    error,
    isLoading,
    requireOtp,
    testOtp,
    handleChange,
    handleOtpChange,
    handleSubmit,
    handleVerifyOtp,
    handleResendOtp
  };
};