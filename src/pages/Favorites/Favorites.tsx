import React from 'react';
import { useFavorites } from '../../context/FavoritesContext';

const Favorites: React.FC = () => {
 const { state: favoritesState, dispatch } = useFavorites();
 const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

 const handleRemove = (productId: number) => {
   dispatch({ type: 'REMOVE_FAVORITE', payload: productId });
 };

 const filteredItems = currentUser 
   ? favoritesState.items.filter(item => item.userId === currentUser.id)
   : favoritesState.items;

 return (
   <div className="container mx-auto px-4 py-8">
     <h1 className="text-2xl font-bold mb-6">المفضلة</h1>
     
     {filteredItems.length === 0 ? (
       <div className="text-center py-12">
         <p className="text-gray-600">لا توجد منتجات في المفضلة</p>
       </div>
     ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredItems.map(item => (
           <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
             <img 
               src={item.image} 
               alt={item.name} 
               className="w-full h-48 object-cover"
             />
             <div className="p-4">
               <h3 className="font-bold text-lg mb-2">{item.name}</h3>
               <p className="text-blue-600 font-bold">
                 {new Intl.NumberFormat('ar-SA', {
                   style: 'currency',
                   currency: 'SAR'
                 }).format(item.price)}
               </p>
               <button 
                 onClick={() => handleRemove(item.id)}
                 className="mt-4 w-full text-red-600 border border-red-600 rounded-lg py-2 hover:bg-red-50 transition-colors"
               >
                 إزالة من المفضلة
               </button>
             </div>
           </div>
         ))}
       </div>
     )}
   </div>
 );
};

export default Favorites;