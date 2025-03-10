// src/hooks/useLogin.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { handleApiError } from '../config/apiConfig';

interface LoginFormData {
  emailOrPhone: string;  // حقل واحد للإيميل أو الهاتف
  password: string;
}

interface OtpFormData {
  otp: string;
  phoneNumber: string;
}

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
      const response = await api.post('/auth/resend-otp', {
        phoneNumber: otpFormData.phoneNumber
      });

      if (response.data.testOtp) {
        setTestOtp(response.data.testOtp);
      }
      
      // عرض رسالة نجاح
      alert(response.data.message || 'تم إرسال رمز التحقق بنجاح');
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
      const response = await api.post('/auth/login', {
        emailOrPhone: formData.emailOrPhone.trim(),
        password: formData.password
      });

      // التحقق مما إذا كان هناك حاجة للتحقق ثنائي العامل OTP
      if (response.data.requireOtp) {
        setRequireOtp(true);
        setOtpFormData(prev => ({
          ...prev,
          phoneNumber: response.data.phoneNumber || ''
        }));
        
        // عرض الرمز سواء كان testOtp أو otp
        const otpCode = response.data.testOtp || response.data.otp;
        if (otpCode) {
          setTestOtp(otpCode);
        }
      
      } else {
        // حفظ بيانات تسجيل الدخول والتوجيه
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));

        if (response.data.user.role === 'admin') {
          navigate('/admin/AdminDashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-otp', {
        phoneNumber: otpFormData.phoneNumber,
        otp: otpFormData.otp
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));

      if (response.data.user.role === 'admin') {
        navigate('/admin/AdminDashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setError(errorMessage);
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