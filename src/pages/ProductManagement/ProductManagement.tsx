import { useState, Fragment } from 'react';
import { useProductManagement } from '../../typerScript/useProductManagement';
import { ProductForm } from '../../components/ProductForm';
import { Product, ProductCategory, CreateProductDto, PRODUCT_CATEGORIES, StockStatus, getStockStatus } from '../../types/product';
import ProductImageCarousel from '../../components/ProductImageCarousel';
import { Dialog, Transition } from '@headlessui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductManagement = () => {
    const { 
        loading, 
        error,
        handleCategoryChange,
        selectedCategory,
        filteredProducts,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct 
    } = useProductManagement();
    
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleAddProduct = async (data: CreateProductDto, files: File[]) => {
        try {
            const success = await addProduct(data, files);
            if (success) {
                toast.success('تم إضافة المنتج بنجاح');
                await refreshProducts();
            }
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('فشل في إضافة المنتج');
        }
    };

    const handleUpdateProduct = async (id: number, data: CreateProductDto, files: File[]) => {
        try {
            const success = await updateProduct(id, data, files);
            if (success) {
                toast.success('تم تحديث المنتج بنجاح');
                setIsEditModalOpen(false);
                setEditingProduct(null);
                await refreshProducts();
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('فشل في تحديث المنتج');
        }
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                const success = await deleteProduct(id);
                if (success) {
                    toast.success('تم حذف المنتج بنجاح');
                    await refreshProducts();
                }
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('فشل في حذف المنتج');
        }
    };

    const getStockClassName = (stock: number): string => {
        const status = getStockStatus(stock);
        switch (status) {
            case StockStatus.IN_STOCK:
                return 'bg-green-100 text-green-800';
            case StockStatus.LOW_STOCK:
                return 'bg-yellow-100 text-yellow-800';
            case StockStatus.OUT_OF_STOCK:
                return 'bg-red-100 text-red-800';
        }
    };

    const getStockLabel = (stock: number): string => {
        const status = getStockStatus(stock);
        switch (status) {
            case StockStatus.IN_STOCK:
                return `المخزون: ${stock}`;
            case StockStatus.LOW_STOCK:
                return `كمية محدودة: ${stock}`;
            case StockStatus.OUT_OF_STOCK:
                return 'نفذ المخزون';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <ToastContainer 
                position="top-center"
                rtl={true}
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
            />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">إدارة المنتجات</h1>

                {error && (
                    <div className="bg-red-100 border-r-4 border-red-500 p-4 mb-6 rounded">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* قسم إضافة منتج جديد */}
                <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
                    <div className="border-b pb-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">إضافة منتج جديد</h2>
                    </div>
                    <ProductForm
                        onSubmit={handleAddProduct}
                        isLoading={loading}
                    />
                </div>

                {/* قسم عرض المنتجات */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="border-b pb-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">المنتجات الحالية</h2>
                        
                        {/* فلتر الفئات */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => handleCategoryChange(null)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                    selectedCategory === null
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                            >
                                الكل
                            </button>
                            {PRODUCT_CATEGORIES.map((category: ProductCategory) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        selectedCategory === category
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            لا توجد منتجات حالياً
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product: Product) => (
                                <div 
                                    key={product.id} 
                                    className="bg-gray-50 rounded-lg overflow-hidden shadow-md transition-all hover:shadow-xl"
                                >
                                    <div className="relative">
                                        <ProductImageCarousel 
                                            images={product.images} 
                                            productName={product.name} 
                                        />
                                        <span className="absolute top-2 right-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                            {product.category}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                                        
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-lg font-bold text-green-600">
                                                {new Intl.NumberFormat('ar-SA', {
                                                    style: 'currency',
                                                    currency: 'SAR'
                                                }).format(product.price)}
                                            </span>
                                            <span className={`text-sm px-2 py-1 rounded-full ${getStockClassName(product.stock)}`}>
                                                {getStockLabel(product.stock)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* نافذة تعديل المنتج */}
                <Transition appear show={isEditModalOpen} as={Fragment}>
                    <Dialog 
                        as="div"
                        className="fixed inset-0 z-50 overflow-y-auto"
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setEditingProduct(null);
                        }}
                    >
                        <div className="min-h-screen px-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-black/30" />
                            </Transition.Child>

                            <span
                                className="inline-block h-screen align-middle"
                                aria-hidden="true"
                            >
                                &#8203;
                            </span>

                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <div className="inline-block w-full max-w-3xl p-6 my-8 text-right align-middle transition-all transform bg-white shadow-xl rounded-lg">
                                    <Dialog.Title 
                                        as="h3" 
                                        className="text-xl font-semibold text-gray-800 mb-6"
                                    >
                                        تعديل المنتج: {editingProduct?.name}
                                    </Dialog.Title>

                                    {editingProduct && (
                                        <ProductForm
                                            initialData={editingProduct}
                                            onSubmit={(data, files) => handleUpdateProduct(editingProduct.id, data, files)}
                                            isLoading={loading}
                                        />
                                    )}

                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            setEditingProduct(null);
                                        }}
                                        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
                                        aria-label="إغلاق"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    );
};

export default ProductManagement;