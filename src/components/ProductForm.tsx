import React, { useState, useEffect } from 'react';
import { CreateProductDto, PRODUCT_CATEGORIES, Product } from '../types/product';
import { X } from 'lucide-react';
import api from '../config/axios';

interface ProductFormProps {
    initialData?: Product;
    onSubmit: (data: CreateProductDto, files: File[]) => Promise<void>;
    isLoading: boolean;
}

const API_URL = 'https://localhost:5000';

const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }

    // تنظيف المسار من أي بادئات متكررة
    const cleanPath = imageUrl
        .replace(/^\/+/, '')  // إزالة الشرطات المائلة من البداية
        .replace(/^images\//, '')  // إزالة 'images/' من البداية
        .replace(/^api\/images\//, ''); // إزالة 'api/images/' من البداية

    return `${API_URL}/images/${cleanPath}`;
};

export const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    onSubmit,
    isLoading
}) => {
    const [formData, setFormData] = useState<CreateProductDto>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: PRODUCT_CATEGORIES[0]
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<Array<{ id: number; imageUrl: string }>>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: initialData.price,
                stock: initialData.stock,
                category: initialData.category
            });
            if (initialData.images) {
                console.log('Setting existing images:', initialData.images);
                setExistingImages(initialData.images);
            }
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
        
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    };

    const handleRemoveSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = async (imageId: number) => {
        try {
            await api.delete(`/api/products/images/${imageId}`);
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('فشل في حذف الصورة');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData, selectedFiles);
        if (!initialData) {
            setFormData({
                name: '',
                description: '',
                price: 0,
                stock: 0,
                category: PRODUCT_CATEGORIES[0]
            });
            setSelectedFiles([]);
            setPreviewUrls([]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">اسم المنتج</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">الفئة</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                        {PRODUCT_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">السعر</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">المخزون</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">الوصف</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
            </div>

            {/* عرض الصور الحالية */}
            {existingImages.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الصور الحالية</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((image) => (
                            <div key={image.id} className="relative group">
                                <img
                                    src={getImageUrl(image.imageUrl)}
                                    alt="صورة المنتج"
                                    className="w-full h-32 object-cover rounded-lg"
                                    onError={(e) => {
                                        console.error('Error loading image:', image.imageUrl);
                                        e.currentTarget.src = 'https://via.placeholder.com/200x200?text=صورة+غير+متوفرة';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExistingImage(image.id)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* معاينة الصور الجديدة المحددة */}
            {previewUrls.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الصور الجديدة المحددة</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={url}
                                    alt={`معاينة ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSelectedFile(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">إضافة صور جديدة</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-50 file:text-purple-700
                        hover:file:bg-purple-100"
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-white ${
                        isLoading
                            ? 'bg-purple-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                >
                    {isLoading ? 'جاري الحفظ...' : initialData ? 'تحديث المنتج' : 'إضافة المنتج'}
                </button>
            </div>
        </form>
    );
};