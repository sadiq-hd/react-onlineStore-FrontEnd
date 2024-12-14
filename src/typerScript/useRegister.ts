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

const API_BASE_URL = 'https://reactbackend20241214202555.azurewebsites.net';

export const useRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
          credentials: 'include', // إضافة هذا السطر
          body: JSON.stringify({
            username: formData.name,
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

        navigate('/signin');
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    formData,
    errors,
    isLoading,
    serverError,
    handleChange,
    handleSubmit
  };
};