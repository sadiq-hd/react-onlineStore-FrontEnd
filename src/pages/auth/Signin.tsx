
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
 id: number;
 email: string;
 password: string;
 name: string;
 role: 'admin' | 'user';
}

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

const Signin: React.FC = () => {
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
   setError('');
 };

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   const user = dummyUsers.find(
     u => u.email === formData.email && u.password === formData.password
   );

   if (user) {
     localStorage.setItem('currentUser', JSON.stringify(user));
     if (user.role === 'admin') {
       navigate('/AdminDashboard');
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
     </div>
   </div>
 );
};

export default Signin;