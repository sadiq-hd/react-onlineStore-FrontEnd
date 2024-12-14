// src/hooks/useLogin.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  emailOrPhone: string;  // حقل واحد للإيميل أو الهاتف
  password: string;
}

const API_BASE_URL = 'https://reactbackend20241214202555.azurewebsites.net';

export const useLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrPhone: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/AdminDashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    error,
    isLoading,
    handleChange,
    handleSubmit
  };
};