import React, { useState } from 'react';
import { useFavorites } from '../../context/FavoritesContext';

interface OrderType {
 id: string;
 date: string;
 total: number;
 status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
 items: Array<{ name: string; quantity: number; price: number }>;
}

const Profile: React.FC = () => {
 const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
 const [activeTab, setActiveTab] = useState('profile');
 const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites();

 if (!currentUser) {
   return <div>يرجى تسجيل الدخول</div>;
 }

 const dummyOrders: OrderType[] = [
   {
     id: '1',
     date: '2024-03-10',
     total: 56.99,
     status: 'completed',
     items: [{ name: 'سماعات سلكية', quantity: 1, price: 56.99 }]
   },
   {
    id: '2',
    date: '2024-03-10',
    total: 100.00,
    status: 'pending',
    items: [{ name: 'شاحن ', quantity: 1, price: 100.00 }]
  },
  {
    id: '3',
    date: '2024-03-10',
    total: 299.99,
    status: 'cancelled',
    items: [{ name: 'سماعات لاسلكية', quantity: 1, price: 299.99 }]
  },
  {
    id: '4',
    date: '2024-03-10',
    total: -299.99,
    status: 'refunded',
    items: [{ name: 'لابتوب ', quantity: 1, price: -299.99 }]
  }
   ,
   {
     id: '5',
     date: '2024-03-10',
   total: 299.99,
    status: 'processing',
    items: [{ name: ' سلك', quantity: 1, price: 299.99 }]
  }
 ];

 return (
   <div className="container mx-auto p-4">
     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
       {/* Sidebar */}
       <div className="md:col-span-1">
         <div className="bg-white rounded-lg shadow p-4">
           <div className="text-center mb-4">
             <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-2">
               <span className="text-2xl">{currentUser.name[0]}</span>
             </div>
             <h2 className="font-bold text-xl">{currentUser.name}</h2>
             <p className="text-gray-600">{currentUser.email}</p>
           </div>

           <div className="space-y-2">
             <button
               onClick={() => setActiveTab('profile')}
               className={`w-full text-right py-2 px-4 rounded ${
                 activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
               }`}
             >
               معلوماتي
             </button>
             <button
               onClick={() => setActiveTab('orders')}
               className={`w-full text-right py-2 px-4 rounded ${
                 activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
               }`}
             >
               طلباتي
             </button>
             <button
               onClick={() => setActiveTab('favorites')}
               className={`w-full text-right py-2 px-4 rounded ${
                 activeTab === 'favorites' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
               }`}
             >
               المفضلة
             </button>
             {currentUser.role === 'admin' && (
               <button
                 onClick={() => setActiveTab('dashboard')}
                 className={`w-full text-right py-2 px-4 rounded ${
                   activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                 }`}
               >
                 لوحة التحكم
               </button>
             )}
           </div>
         </div>
       </div>

       {/* Main Content */}
       <div className="md:col-span-3">
         <div className="bg-white rounded-lg shadow p-6">
           {activeTab === 'profile' && (
             <div>
               <h3 className="text-xl font-bold mb-4">المعلومات الشخصية</h3>
               <form className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">الاسم</label>
                   <input
                     type="text"
                     defaultValue={currentUser.name}
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                   <input
                     type="email"
                     defaultValue={currentUser.email}
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                   <input
                     type="tel"
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                   />
                 </div>
                 <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                   حفظ التغييرات
                 </button>
               </form>
             </div>
           )}

           {activeTab === 'orders' && (
             <div>
               <h3 className="text-xl font-bold mb-4">طلباتي</h3>
               <div className="space-y-4">
                 {dummyOrders.map(order => (
                   <div key={order.id} className="border rounded-lg p-4">
                     <div className="flex justify-between items-center mb-2">
                       <span className="font-medium">طلب #{order.id}</span>
                       <span className="text-sm text-gray-600">{order.date}</span>
                     </div>
                     {order.items.map((item, index) => (
                       <div key={index} className="flex justify-between items-center text-sm text-gray-600">
                         <span>{item.name} × {item.quantity}</span>
                         <span>{item.price} ر.س</span>
                       </div>
                     ))}
               <div className="mt-2 flex justify-between items-center">
  <span className="font-medium">الإجمالي: {order.total} ر.س</span>
  <span className={`text-sm ${
    order.status === 'completed' ? 'text-green-600' :
    order.status === 'processing' ? 'text-yellow-600' :
    order.status === 'cancelled' ? 'text-red-600' :
    order.status === 'refunded' ? 'text-gray-600' :
    order.status=== 'pending'?'text-blue-500':
    'text-gray-600'
  }`}>
    {order.status === 'completed' ? 'مكتمل' :
    order.status === 'processing' ? 'قيد المعالجة' :
    order.status === 'cancelled' ? 'ملغي' :
    order.status=== 'pending'?'معلق':
    order.status === 'refunded' ? 'مسترد' :
    'غير معروف'}
  </span>
</div>
</div>
))}
</div>
</div>
)}

           {activeTab === 'favorites' && (
             <div>
               <h3 className="text-xl font-bold mb-4">المفضلة</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {favoritesState.items
                   .filter(item => item.userId === currentUser.id)
                   .map(item => (
                     <div key={item.id} className="border rounded-lg p-4">
                       <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-2" />
                       <h4 className="font-bold">{item.name}</h4>
                       <p className="text-blue-600">
                         {new Intl.NumberFormat('ar-SA', {
                           style: 'currency',
                           currency: 'SAR'
                         }).format(item.price)}
                       </p>
                       <button 
                         onClick={() => favoritesDispatch({ type: 'REMOVE_FAVORITE', payload: item.id })}
                         className="mt-2 text-red-600 text-sm hover:underline"
                       >
                         إزالة من المفضلة
                       </button>
                     </div>
                   ))}
               </div>
             </div>
           )}

           {activeTab === 'dashboard' && currentUser.role === 'admin' && (
             <div>
               <h3 className="text-xl font-bold mb-4">لوحة التحكم</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-blue-50 p-4 rounded-lg">
                   <h4 className="font-bold text-blue-700">إجمالي الطلبات</h4>
                   <p className="text-2xl font-bold">120</p>
                 </div>
                 <div className="bg-green-50 p-4 rounded-lg">
                   <h4 className="font-bold text-green-700">المبيعات</h4>
                   <p className="text-2xl font-bold">15,000 ر.س</p>
                 </div>
                 <div className="bg-yellow-50 p-4 rounded-lg">
                   <h4 className="font-bold text-yellow-700">المستخدمين</h4>
                   <p className="text-2xl font-bold">50</p>
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   </div>
 );
};

export default Profile;