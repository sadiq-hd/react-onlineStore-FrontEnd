// src/components/home/NewsletterSection.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // هنا يمكن إضافة شيفرة API للاشتراك في النشرة البريدية
      // await newsletterService.subscribe(email);
      
      // نظهر رسالة نجاح مؤقتة
      toast.success('تم الاشتراك بنجاح في النشرة البريدية');
      setEmail('');
    } catch (error) {
      toast.error('حدث خطأ أثناء الاشتراك، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold mb-2">اشترك في نشرتنا البريدية</h3>
            <p className="text-purple-100 text-sm">احصل على آخر العروض والتخفيضات مباشرة إلى بريدك الإلكتروني</p>
          </div>
          <form onSubmit={handleSubmit} className="w-full md:w-auto">
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="flex-1 rounded-r-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-white text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-l-lg font-medium transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : 'اشتراك'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSection;