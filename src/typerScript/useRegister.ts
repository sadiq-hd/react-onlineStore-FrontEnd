import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const API_BASE_URL = 'https://localhost:5000/api';
// const API_BASE_URL = 'https://reactbackend20241214202555.azurewebsites.net';

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
      setServerError(err instanceof Error ? err.message : 'حدث خطأ أثناء إعادة إرسال رمز التحقق');
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
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            username: formData.email, // تعديل: استخدام البريد الإلكتروني كاسم المستخدم
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'حدث خطأ أثناء إنشاء الحساب');
        }

        const data = await response.json();
        
        // التحقق مما إذا كان هناك حاجة للتحقق من رقم الهاتف
        if (data.requirePhoneVerification) {
          setRequirePhoneVerification(true);
          setOtpFormData(prev => ({
            ...prev,
            phoneNumber: data.phoneNumber || ''
          }));
          
          // حفظ OTP للاختبار في بيئة التطوير
          if (data.testOtp) {
            setTestOtp(data.testOtp);
          }
        } else {
          navigate('/signin');
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب');
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
      const response = await fetch(`${API_BASE_URL}/auth/verify-phone`, {
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

      // التوجيه بناءً على دور المستخدم
      if (data.user.role === 'admin') {
        navigate('/admin/AdminDashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحقق من الرمز');
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