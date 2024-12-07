import React from 'react';

const ContactMe: React.FC = () => {
 return (
   <div className="min-h-screen bg-gray-50 py-12">
  
         {/* Contact Form */}
         <div className="bg-white rounded-2xl shadow-lg p-8">
           <h2 className="text-2xl font-bold text-gray-800 mb-6"> تواصل معنا</h2>
           <form className="space-y-4">
             <div>
               <label className="block text-gray-700 mb-2">الاسم</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="أدخل اسمك"
               />
             </div>
             
             <div>
               <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
               <input 
                 type="email" 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="أدخل بريدك الإلكتروني"
               />
             </div>

             <div>
               <label className="block text-gray-700 mb-2">الرسالة</label>
               <textarea 
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                 placeholder="اكتب رسالتك هنا"
               ></textarea>
             </div>

             <button 
               type="submit" 
               className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
             >
               إرسال 
             </button>
           </form>
         </div>
       </div>


     
 );
};

export default ContactMe;