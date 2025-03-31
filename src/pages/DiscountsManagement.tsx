import React, { useState, useEffect } from 'react';
import { discountService } from '../services/discountService';
import { productService } from '../services/productService';
import { CreateDiscountDto, Discount, DiscountScope, DiscountType } from '../types/discount';
import { Product, PRODUCT_CATEGORIES } from '../types/product';

const DiscountsManagement: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // نموذج إضافة/تعديل الخصم
  const [formData, setFormData] = useState<Partial<CreateDiscountDto>>({
    name: '',
    description: '',
    type: DiscountType.Percentage,
    value: 0,
    scope: DiscountScope.AllProducts,
    categoryName: undefined,
    productIds: [],
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    isActive: true
  });

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await discountService.getAllDiscounts();
      console.log("Fetched discounts data:", data);
      setDiscounts(data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setError('فشل في تحميل التخفيضات، الرجاء المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('فشل في تحميل المنتجات، الرجاء المحاولة مرة أخرى');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;
    
    if (type === 'number') {
      processedValue = parseFloat(value);
    } else if (name === 'type') {
      // تحويل القيمة من string إلى enum
      processedValue = parseInt(value, 10) as DiscountType;
      
      // إذا تم تغيير نوع الخصم، قم بتحديث القيمة تلقائياً إلى قيمة افتراضية منطقية
      if (processedValue === DiscountType.Percentage && formData.value && formData.value > 100) {
        setFormData(prev => ({ ...prev, value: 10 })); // قيمة افتراضية للنسبة المئوية
      } else if (processedValue === DiscountType.FixedAmount && formData.value && formData.value < 1) {
        setFormData(prev => ({ ...prev, value: 50 })); // قيمة افتراضية للمبلغ الثابت
      }
    } else if (name === 'scope') {
      // تحويل القيمة من string إلى enum
      processedValue = parseInt(value, 10) as DiscountScope;
      
      // إعادة تعيين القيم ذات الصلة حسب نطاق التخفيض
      if (processedValue === DiscountScope.AllProducts) {
        setFormData(prev => ({
          ...prev,
          categoryName: undefined,
          productIds: []
        }));
      } else if (processedValue === DiscountScope.Category) {
        setFormData(prev => ({
          ...prev,
          productIds: []
        }));
      } else if (processedValue === DiscountScope.Product) {
        setFormData(prev => ({
          ...prev,
          categoryName: undefined
        }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // تحضير البيانات المناسبة لـ CreateDiscountDto
      const dataToSend: CreateDiscountDto = {
        name: formData.name || '',
        description: formData.description || '',
        type: Number(formData.type) as DiscountType,
        value: Number(formData.value || 0),
        scope: Number(formData.scope) as DiscountScope,
        categoryName: Number(formData.scope) === DiscountScope.Category ? formData.categoryName : undefined,
        // تأكد من أن productIds هو مصفوفة من الأرقام
        productIds: Number(formData.scope) === DiscountScope.Product ? 
                  Array.isArray(formData.productIds) ? formData.productIds : [] : [],
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date().toISOString(),
        isActive: formData.isActive ?? true
      };
      
      console.log("Sending discount data:", JSON.stringify(dataToSend, null, 2));
      
      if (selectedDiscount) {
        await discountService.updateDiscount(selectedDiscount.id, dataToSend);
        console.log(`Successfully updated discount ID: ${selectedDiscount.id}`);
      } else {
        await discountService.createDiscount(dataToSend);
        console.log("Successfully created new discount");
      }
      
      resetForm();
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      setError(error.message || 'حدث خطأ أثناء حفظ التخفيض، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDiscount(null);
    setFormData({
      name: '',
      description: '',
      type: DiscountType.Percentage,
      value: 0,
      scope: DiscountScope.AllProducts,
      categoryName: undefined,
      productIds: [],
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      isActive: true
    });
  };

  const handleEdit = async (discount: Discount) => {
    setSelectedDiscount(discount);
    setError(null);
    
    try {
      // الحصول على بيانات الخصم كاملة من الخادم
      const fullDiscountData = await discountService.getDiscount(discount.id);
      console.log("Full discount data from server:", fullDiscountData);
      
      // تحويل products إلى productIds
      let productIds: number[] = [];
      if (fullDiscountData.products && fullDiscountData.products.length > 0) {
        productIds = fullDiscountData.products.map(p => p.productId);
      }
      
      // تعيين القيم بشكل صحيح
      setFormData({
        name: fullDiscountData.name,
        description: fullDiscountData.description,
        type: fullDiscountData.type,
        value: fullDiscountData.value,
        scope: fullDiscountData.scope,
        categoryName: fullDiscountData.categoryName,
        productIds: productIds,
        startDate: fullDiscountData.startDate,
        endDate: fullDiscountData.endDate,
        isActive: fullDiscountData.isActive
      });
      
      console.log("Form data after loading for edit:", {
        type: fullDiscountData.type,
        scope: fullDiscountData.scope,
        productIds: productIds,
        categoryName: fullDiscountData.categoryName
      });
      
    } catch (error) {
      console.error("Error loading full discount data:", error);
      setError("حدث خطأ أثناء تحميل بيانات التخفيض، يرجى المحاولة مرة أخرى");
    }
  };
  
  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التخفيض؟')) {
      setLoading(true);
      setError(null);
      try {
        await discountService.deleteDiscount(id);
        fetchDiscounts();
      } catch (error) {
        console.error('Error deleting discount:', error);
        setError('فشل في حذف التخفيض، الرجاء المحاولة مرة أخرى');
      } finally {
        setLoading(false);
      }
    }
  };

  // تحويل نوع التخفيض إلى نص للعرض
  const getDiscountTypeText = (type: number | string | undefined): string => {
    if (type === undefined || type === null) {
      return 'غير محدد';
    }
    
    // التعامل مع القيم النصية
    if (typeof type === 'string') {
      if (type === 'Percentage') return 'نسبة مئوية';
      if (type === 'FixedAmount') return 'مبلغ ثابت';
      
      // محاولة تحويل النص إلى رقم
      const numericType = parseInt(type, 10);
      if (!isNaN(numericType)) {
        return numericType === DiscountType.Percentage ? 'نسبة مئوية' : 'مبلغ ثابت';
      }
      
      return `نوع: ${type}`;
    }
    
    // التعامل مع القيم الرقمية
    return type === DiscountType.Percentage ? 'نسبة مئوية' : 'مبلغ ثابت';
  };

  // تحويل نطاق التخفيض إلى نص للعرض
  const getDiscountScopeText = (discount: Discount): string => {
    const { scope, categoryName, products } = discount;
    
    if (scope === undefined || scope === null) {
      return 'غير محدد';
    }
    
    // التعامل مع القيم النصية
    if (typeof scope === 'string') {
      if (scope === 'AllProducts' || scope === 'Global') return 'جميع المنتجات';
      if (scope === 'Category') return `فئة: ${categoryName || 'غير محددة'}`;
      if (scope === 'Product') {
        const productCount = products?.length || 0;
        return `منتجات محددة (${productCount})`;
      }
      
      // محاولة تحويل النص إلى رقم
      const numericScope = parseInt(scope, 10);
      if (!isNaN(numericScope)) {
        if (numericScope === DiscountScope.AllProducts) return 'جميع المنتجات';
        if (numericScope === DiscountScope.Category) return `فئة: ${categoryName || 'غير محددة'}`;
        if (numericScope === DiscountScope.Product) {
          const productCount = products?.length || 0;
          return `منتجات محددة (${productCount})`;
        }
      }
      
      return `نطاق: ${scope}`;
    }
    
    // التعامل مع القيم الرقمية
    if (scope === DiscountScope.AllProducts) {
      return 'جميع المنتجات';
    } else if (scope === DiscountScope.Category) {
      return `فئة: ${categoryName || 'غير محددة'}`;
    } else if (scope === DiscountScope.Product) {
      const productCount = products?.length || 0;
      return `منتجات محددة (${productCount})`;
    }
    
    return `نطاق آخر (${scope})`;
  };

  // تحويل القيمة إلى نص مع الوحدة المناسبة
  const getDiscountValueText = (discount: Discount): string => {
    const normalizedType = typeof discount.type === 'string' 
      ? (discount.type === 'Percentage' ? DiscountType.Percentage : DiscountType.FixedAmount)
      : discount.type;
    
    return `${discount.value}${normalizedType === DiscountType.Percentage ? '%' : ' ريال'}`;
  };

  // دالة مساعدة للتحقق من الحالات التي يجب فيها عرض منتجات محددة
  const shouldShowProductSelection = (): boolean => {
    return Number(formData.scope) === DiscountScope.Product;
  };
  
  // دالة مساعدة للتحقق من الحالات التي يجب فيها عرض فئة محددة
  const shouldShowCategorySelection = (): boolean => {
    return Number(formData.scope) === DiscountScope.Category;
  };

  // دالة مساعدة للتحقق من اختيار منتج
  const isProductSelected = (productId: number): boolean => {
    return formData.productIds?.includes(productId) || false;
  };

  // دالة مساعدة لإضافة أو إزالة منتج من القائمة
  const toggleProductSelection = (productId: number): void => {
    let newProductIds: number[] = [...(formData.productIds || [])];
    
    if (isProductSelected(productId)) {
      // إزالة المنتج
      newProductIds = newProductIds.filter(id => id !== productId);
    } else {
      // إضافة المنتج
      newProductIds.push(productId);
    }
    
    setFormData(prev => ({ ...prev, productIds: newProductIds }));
  };

  return (
    <div dir="rtl" className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">إدارة التخفيضات</h1>
      
      {/* عرض رسائل الخطأ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 shadow-sm" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* نموذج إضافة/تعديل التخفيض */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          {selectedDiscount ? 'تعديل التخفيض' : 'إضافة تخفيض جديد'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* الحقول الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="discount-name" className="block text-sm font-medium text-gray-700 mb-1">اسم التخفيض</label>
              <input
                id="discount-name"
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <div className="mt-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleCheckboxChange}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="mr-2 text-gray-700">نشط</span>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="discount-description" className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea
              id="discount-description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={2}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-sm"
            />
          </div>
          
          {/* تفاصيل التخفيض */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="discount-type" className="block text-sm font-medium text-gray-700 mb-1">نوع التخفيض</label>
              <select
                id="discount-type"
                name="type"
                value={formData.type?.toString() || '0'}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-sm"
              >
                <option value={DiscountType.Percentage.toString()}>نسبة مئوية</option>
                <option value={DiscountType.FixedAmount.toString()}>مبلغ ثابت</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="discount-value" className="block text-sm font-medium text-gray-700 mb-1">قيمة التخفيض</label>
              <input
                id="discount-value"
                type="number"
                name="value"
                value={formData.value || 0}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {Number(formData.type) === DiscountType.Percentage ? '% نسبة مئوية' : 'قيمة بالريال'}
              </p>
            </div>
          </div>

          {/* نطاق التخفيض */}
          <div>
            <label htmlFor="discount-scope" className="block text-sm font-medium text-gray-700 mb-1">نطاق تطبيق التخفيض</label>
            <select
              id="discount-scope"
              name="scope"
              value={formData.scope?.toString() || '0'}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-sm"
            >
              <option value={DiscountScope.AllProducts.toString()}>جميع المنتجات</option>
              <option value={DiscountScope.Category.toString()}>فئة محددة</option>
              <option value={DiscountScope.Product.toString()}>منتجات محددة</option>
            </select>
          </div>
          
          {/* حقول إضافية تظهر حسب نطاق التخفيض */}
          {shouldShowCategorySelection() && (
            <div>
              <label htmlFor="discount-category" className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <select
                id="discount-category"
                name="categoryName"
                value={formData.categoryName || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-sm"
                required
              >
                <option value="">اختر الفئة</option>
                {PRODUCT_CATEGORIES.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
          
          {shouldShowProductSelection() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المنتجات</label>
              <div className="mt-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-gray-50">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center p-4">جاري تحميل المنتجات...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                        <input
                          type="checkbox"
                          id={`product-${product.id}`}
                          checked={isProductSelected(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <label htmlFor={`product-${product.id}`} className="mr-2 text-sm cursor-pointer truncate">{product.name}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formData.productIds && formData.productIds.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  تم اختيار {formData.productIds.length} منتج
                </p>
              )}
            </div>
          )}
          
          {/* تواريخ بداية ونهاية التخفيض */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
              <input
                id="start-date"
                type="datetime-local"
                name="startDate"
                value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
              <input
                id="end-date"
                type="datetime-local"
                name="endDate"
                value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 text-sm"
              />
            </div>
          </div>
          
          {/* أزرار التحكم */}
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'جاري الحفظ...' : (selectedDiscount ? 'تحديث التخفيض' : 'إضافة التخفيض')}
            </button>
          </div>
        </form>
      </div>
      
      {/* قائمة التخفيضات */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4 md:p-6 bg-gray-50 border-b">قائمة التخفيضات</h2>
        
        {loading && discounts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg className="animate-spin h-8 w-8 mx-auto text-purple-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            جاري التحميل...
          </div>
        ) : discounts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            لا توجد تخفيضات
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="lg:hidden">
              {/* عرض للهواتف والشاشات الصغيرة: قائمة بطاقات */}
              <div className="space-y-4 p-4">
                {discounts.map((discount) => (
                  <div key={discount.id} className="border rounded-md p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{discount.name}</h3>
                      <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${
                        discount.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {discount.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-gray-500">نوع التخفيض:</div>
                      <div className="text-gray-900">{getDiscountTypeText(discount.type)}</div>
                      
                      <div className="text-gray-500">القيمة:</div>
                      <div className="text-gray-900">{getDiscountValueText(discount)}</div>
                      
                      <div className="text-gray-500">النطاق:</div>
                      <div className="text-gray-900">{getDiscountScopeText(discount)}</div>
                      
                      <div className="text-gray-500">تاريخ البدء:</div>
                      <div className="text-gray-900">{new Date(discount.startDate).toLocaleString('ar-SA')}</div>
                      
                      <div className="text-gray-500">تاريخ الانتهاء:</div>
                      <div className="text-gray-900">{new Date(discount.endDate).toLocaleString('ar-SA')}</div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t flex justify-end space-x-3 space-x-reverse">
                      <button
                        onClick={() => handleEdit(discount)}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* عرض للشاشات المتوسطة والكبيرة: جدول */}
            <table className="hidden lg:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع التخفيض
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    القيمة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النطاق
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ البدء
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الانتهاء
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {discount.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDiscountTypeText(discount.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDiscountValueText(discount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDiscountScopeText(discount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(discount.startDate).toLocaleString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(discount.endDate).toLocaleString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        discount.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {discount.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <button
                        onClick={() => handleEdit(discount)}
                        className="text-indigo-600 hover:text-indigo-900 ml-4 transition-colors"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* شريط تنقل صغير أسفل الصفحة للعودة إلى الأعلى - مفيد للشاشات الصغيرة */}
      <div className="fixed bottom-4 left-4 md:hidden">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DiscountsManagement;