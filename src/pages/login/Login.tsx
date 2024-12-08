
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// تعريف نوع المستخدم
interface User {
 id: number;
 email: string;
 password: string;
 name: string;
 role: 'admin' | 'user';
}

// المستخدمون الوهميون
const dummyUsers: User[] = [
 {
   id: 1,
   email: 'admin@example.com',
   password: 'admin123',
   name: 'المدير',
   role: 'admin'
 },
 {
   id: 2,
   email: 'user@example.com',
   password: 'user123',
   name: 'مستخدم',
   role: 'user'
 }
];

const Login: React.FC = () => {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
   email: '',
   password: ''
 });
 const [error, setError] = useState('');

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   setFormData(prev => ({
     ...prev,
     [e.target.name]: e.target.value
   }));
   setError(''); // مسح رسالة الخطأ عند الكتابة
 };

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   const user = dummyUsers.find(
     u => u.email === formData.email && u.password === formData.password
   );

   if (user) {
     // تخزين معلومات المستخدم في localStorage
     localStorage.setItem('currentUser', JSON.stringify(user));
     // توجيه المستخدم حسب نوع حسابه
     if (user.role === 'admin') {
       navigate('/');
     } else {
       navigate('/');
     }
   } else {
     setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
   }
 };

 return (
   <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
     <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
       <div className="text-center">
         <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
           تسجيل الدخول
         </h2>
         <p className="text-sm text-gray-600 mb-8">
           ليس لديك حساب؟{' '}
           <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
             سجل الآن
           </a>
         </p>
       </div>

       <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
         <h3 className="text-sm font-medium text-yellow-800 mb-2">حسابات تجريبية:</h3>
         <div className="text-sm text-yellow-700">
           <p>المدير: admin@example.com / admin123</p>
           <p>مستخدم: user@example.com / user123</p>
         </div>
       </div>

       <form onSubmit={handleSubmit} className="space-y-6">
         {error && (
           <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
             {error}
           </div>
         )}

         <div>
           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
             البريد الإلكتروني
           </label>
           <input
             type="email"
             id="email"
             name="email"
             required
             value={formData.email}
             onChange={handleChange}
             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
             placeholder="أدخل بريدك الإلكتروني"
           />
         </div>

         <div>
           <div className="flex items-center justify-between mb-1">
             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
               كلمة المرور
             </label>
             <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
               نسيت كلمة المرور؟
             </a>
           </div>
           <input
             type="password"
             id="password"
             name="password"
             required
             value={formData.password}
             onChange={handleChange}
             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
             placeholder="أدخل كلمة المرور"
           />
         </div>

         <div className="flex items-center">
           <input
             id="remember-me"
             name="remember-me"
             type="checkbox"
             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
           />
           <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-700">
             تذكرني
           </label>
         </div>

         <button
           type="submit"
           className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
         >
           تسجيل الدخول
         </button>
       </form>

       {/* طرق تسجيل دخول أخرى */}
       <div className="mt-6">
         <div className="relative">
           <div className="absolute inset-0 flex items-center">
             <div className="w-full border-t border-gray-300"></div>
           </div>
           <div className="relative flex justify-center text-sm">
             <span className="px-2 bg-white text-gray-500">
               أو سجل الدخول باستخدام
             </span>
           </div>
         </div>

         <div className="grid grid-cols-2 gap-3 mt-6">
           <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
               <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.411 2.865 8.138 6.839 9.465.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.135 20 14.41 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
             </svg>
           </button>
           <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
               <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
             </svg>
           </button>
         </div>
       </div>
     </div>
   </div>
 );
};

export default Login;