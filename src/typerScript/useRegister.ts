import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { handleApiError } from '../config/apiConfig';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

interface RegisterErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

interface OtpFormData {
  otp: string;
  phoneNumber: string;
}

export const useRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const [otpFormData, setOtpFormData] = useState<OtpFormData>({
    otp: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState<RegisterErrors>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [requirePhoneVerification, setRequirePhoneVerification] = useState(false);
  const [testOtp, setTestOtp] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setServerError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setServerError('');
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setServerError('');

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
      const errorMessage = handleApiError(err).message;
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setServerError('');

      try {
        const response = await api.post('/auth/register', {
          username: formData.email, // تعديل: استخدام البريد الإلكتروني كاسم المستخدم
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        });

        // التحقق مما إذا كان هناك حاجة للتحقق من رقم الهاتف
        if (response.data.requirePhoneVerification) {
          setRequirePhoneVerification(true);
          setOtpFormData(prev => ({
            ...prev,
            phoneNumber: response.data.phoneNumber || ''
          }));
          
          // حفظ OTP للاختبار في بيئة التطوير
          if (response.data.testOtp) {
            setTestOtp(response.data.testOtp);
          }
        } else {
          navigate('/signin');
        }
      } catch (err) {
        const errorMessage = handleApiError(err).message;
        setServerError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    try {
      const response = await api.post('/auth/verify-phone', {
        phoneNumber: otpFormData.phoneNumber,
        otp: otpFormData.otp
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));

      // التوجيه بناءً على دور المستخدم
      if (response.data.user.role === 'admin') {
        navigate('/admin/AdminDashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = handleApiError(err).message;
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    otpFormData,
    errors,
    isLoading,
    serverError,
    requirePhoneVerification,
    testOtp,
    handleChange,
    handleOtpChange,
    handleSubmit,
    handleVerifyPhone,
    handleResendOtp
  };
};