import React, { useState } from 'react';
import { CreateProductDto, ProductCategory, PRODUCT_CATEGORIES } from '../types/product';

interface ProductFormProps {
   initialData?: CreateProductDto;
   onSubmit: (data: CreateProductDto, files: File[]) => Promise<void>;
   isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
   initialData,
   onSubmit,
   isLoading
}) => {
   const [formData, setFormData] = useState<CreateProductDto>(initialData || {
       category: PRODUCT_CATEGORIES[0], // تعيين أول فئة كقيمة افتراضية
       name: '',
       price: 0,
       stock: 0,
       description: ''
   });
   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
   const [previewUrls, setPreviewUrls] = useState<string[]>([]);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       if (e.target.files) {
           const files = Array.from(e.target.files);
           setSelectedFiles(prev => [...prev, ...files]);
           
           const newPreviewUrls = files.map(file => URL.createObjectURL(file));
           setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
       }
   };

   const removeImage = (index: number) => {
       setSelectedFiles(prev => prev.filter((_, i) => i !== index));
       setPreviewUrls(prev => {
           URL.revokeObjectURL(prev[index]);
           return prev.filter((_, i) => i !== index);
       });
   };

   const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       await onSubmit(formData, selectedFiles);
       if (!initialData) {
           setFormData({
               category: PRODUCT_CATEGORIES[0],
               name: '',
               price: 0,
               stock: 0,
               description: ''
           });
           previewUrls.forEach(url => URL.revokeObjectURL(url));
           setSelectedFiles([]);
           setPreviewUrls([]);
       }
   };

   const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
       const categoryValue = e.target.value as ProductCategory;
       setFormData(prev => ({ ...prev, category: categoryValue }));
   };

   return (
       <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* معلومات المنتج الأساسية */}
               <div className="space-y-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           الفئة
                       </label>
                       <select
                           value={formData.category}
                           onChange={handleCategoryChange}
                           className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                           required
                       >
                           {PRODUCT_CATEGORIES.map(category => (
                               <option key={category} value={category}>
                                   {category}
                               </option>
                           ))}
                       </select>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           اسم المنتج
                       </label>
                       <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                           required
                       />
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           السعر
                       </label>
                       <div className="relative">
                           <input
                               type="number"
                               value={formData.price}
                               onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                               className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 pr-12"
                               min="0"
                               step="0.01"
                               required
                           />
                           <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                               ريال
                           </div>
                       </div>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           الكمية المتوفرة
                       </label>
                       <input
                           type="number"
                           value={formData.stock}
                           onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                           className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                           min="0"
                           required
                       />
                   </div>
               </div>

               {/* الوصف والصور */}
               <div className="space-y-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           وصف المنتج
                       </label>
                       <textarea
                           value={formData.description}
                           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                           rows={4}
                           className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                           required
                       />
                   </div>

                   {/* قسم الصور */}
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                           صور المنتج
                       </label>
                       <div className="mt-2 grid grid-cols-2 gap-2">
                           {previewUrls.map((url, index) => (
                               <div key={index} className="relative group">
                                   <img
                                       src={url}
                                       alt={`Preview ${index + 1}`}
                                       className="w-full h-32 object-cover rounded-lg"
                                   />
                                   <button
                                       type="button"
                                       onClick={() => removeImage(index)}
                                       className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full
                                                opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                       ×
                                   </button>
                               </div>
                           ))}
                           {previewUrls.length < 5 && (
                               <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg
                                               flex items-center justify-center cursor-pointer
                                               hover:border-purple-500 transition-colors">
                                   <input
                                       type="file"
                                       onChange={handleFileChange}
                                       accept="image/*"
                                       className="hidden"
                                       multiple
                                   />
                                   <div className="text-center">
                                       <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                       </svg>
                                       <span className="mt-2 block text-sm text-gray-600">
                                           أضف صورة
                                       </span>
                                   </div>
                               </label>
                           )}
                       </div>
                       <p className="mt-1 text-sm text-gray-500">
                           يمكنك إضافة حتى 5 صور للمنتج
                       </p>
                   </div>
               </div>
           </div>

           {/* زر الإرسال */}
           <div className="flex justify-end">
               <button
                   type="submit"
                   disabled={isLoading || selectedFiles.length === 0}
                   className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition duration-150 ease-in-out"
               >
                   {isLoading ? (
                       <span className="flex items-center">
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           جاري الحفظ...
                       </span>
                   ) : (
                       initialData ? 'تحديث المنتج' : 'إضافة المنتج'
                   )}
               </button>
           </div>
       </form>
   );
};

export default ProductForm;