import React, { useState, useEffect } from 'react';
import { discountService } from '../services/discountService';
import { productService } from '../services/productService';
import { CreateDiscountDto, Discount, DiscountScope, DiscountType } from '../types/discount';
import { Product, PRODUCT_CATEGORIES } from '../types/product';

// استخدام القيم المحددة بدلاً من استخدام ProductCategory كقيمة
const DiscountsManagement: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // نموذج إضافة/تعديل الخصم
  const [formData, setFormData] = useState<Partial<Discount>>({
    name: '',
    description: '',
    type: DiscountType.Percentage,
    value: 0,
    scope: DiscountScope.AllProducts,
    categoryName: undefined,
    products: [],
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
    try {
      const data = await discountService.getAllDiscounts();
      console.log("Fetched discounts data:", data);

      data.forEach(discount => console.log(`Discount ${discount.id}: scope=${discount.scope}, type=${typeof discount.scope}`));
setDiscounts(data);

      setDiscounts(data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;
    
    if (type === 'number') {
      processedValue = parseFloat(value);
    } else if (name === 'type') {
      // تحويل القيمة من string إلى enum
      const typeValue = parseInt(value, 10) as DiscountType;
      processedValue = typeValue;
      
      // إذا تم تغيير نوع الخصم، قم بتحديث القيمة تلقائياً إلى قيمة افتراضية منطقية
      if (typeValue === DiscountType.Percentage && formData.value && formData.value > 100) {
        setFormData(prev => ({ ...prev, value: 10 })); // قيمة افتراضية للنسبة المئوية
      } else if (typeValue === DiscountType.FixedAmount && formData.value && formData.value < 1) {
        setFormData(prev => ({ ...prev, value: 50 })); // قيمة افتراضية للمبلغ الثابت
      }
    } else if (name === 'scope') {
      // تحويل القيمة من string إلى enum
      const scopeValue = parseInt(value, 10) as DiscountScope;
      
      // إعادة تعيين القيم ذات الصلة
      if (scopeValue === DiscountScope.AllProducts) {
        setFormData(prev => ({
          ...prev,
          categoryName: undefined,
          products: []
        }));
      } else if (scopeValue === DiscountScope.Category) {
        setFormData(prev => ({
          ...prev,
          products: []
        }));
      } else if (scopeValue === DiscountScope.Product) {
        setFormData(prev => ({
          ...prev,
          categoryName: undefined
        }));
      }
      
      processedValue = scopeValue;
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
    
    try {
      // تحضير البيانات المناسبة لـ CreateDiscountDto
      const dataToSend: CreateDiscountDto = {
        name: formData.name || '',
        description: formData.description || '',
        type: Number(formData.type || DiscountType.Percentage),
        value: Number(formData.value || 0),
        scope: Number(formData.scope || DiscountScope.AllProducts),
        categoryName: Number(formData.scope) === DiscountScope.Category ? formData.categoryName : undefined,
        // تأكد من أن productIds هو مصفوفة
        productIds: Number(formData.scope) === DiscountScope.Product && formData.products?.length ? 
                  formData.products.map(p => p.productId) : [],
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
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('حدث خطأ أثناء حفظ الخصم، يرجى المحاولة مرة أخرى');
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
      products: [],
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      isActive: true
    });
  };

  const handleEdit = async (discount: Discount) => {
    setSelectedDiscount(discount);
    
    try {
      // الحصول على بيانات الخصم كاملة من الخادم
      const fullDiscountData = await discountService.getDiscount(discount.id);
      console.log("Full discount data from server:", fullDiscountData);
      
      // تحويل البيانات لتناسب نموذج FormData
      const productsMapped = fullDiscountData.products
        ?.filter(p => p.id !== undefined) // فلترة المنتجات التي لها id محدد
        .map(p => ({
          productId: p.id as number // تأكيد أن p.id هو رقم بالفعل
        })) || [];
      
      // تحويل type و scope إلى أرقام
      const numericType = typeof fullDiscountData.type === 'string' 
        ? parseInt(fullDiscountData.type, 10) 
        : fullDiscountData.type;
        
      const numericScope = typeof fullDiscountData.scope === 'string' 
        ? parseInt(fullDiscountData.scope, 10) 
        : fullDiscountData.scope;
      
      // تعيين القيم بشكل صحيح
      setFormData({
        name: fullDiscountData.name,
        description: fullDiscountData.description,
        type: numericType,
        value: fullDiscountData.value,
        scope: numericScope,
        categoryName: fullDiscountData.categoryName,
        products: productsMapped,
        startDate: fullDiscountData.startDate,
        endDate: fullDiscountData.endDate,
        isActive: fullDiscountData.isActive
      });
      
      console.log("Form data after loading for edit:", {
        type: numericType,
        scope: numericScope,
        products: productsMapped,
        categoryName: fullDiscountData.categoryName
      });
      
    } catch (error) {
      console.error("Error loading full discount data:", error);
      alert("حدث خطأ أثناء تحميل بيانات الخصم، يرجى المحاولة مرة أخرى");
    }
  };
  
  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الخصم؟')) {
      setLoading(true);
      try {
        await discountService.deleteDiscount(id);
        fetchDiscounts();
      } catch (error) {
        console.error('Error deleting discount:', error);
      } finally {
        setLoading(false);
      }
    }
  };
// تحويل نوع الخصم إلى نص للعرض
const getDiscountTypeText = (type: DiscountType | string) => {
    // التعامل مع القيم النصية المعادة من الخادم
    if (typeof type === 'string') {
      if (type === 'Percentage') return 'نسبة مئوية';
      if (type === 'FixedAmount') return 'مبلغ ثابت';
      
      // محاولة تحويل النص إلى رقم
      const numericType = parseInt(type, 10);
      if (!isNaN(numericType)) {
        if (numericType === DiscountType.Percentage) return 'نسبة مئوية';
        if (numericType === DiscountType.FixedAmount) return 'مبلغ ثابت';
      }
      
      return `نوع: ${type}`;
    }
    
    // التعامل مع القيم الرقمية
    if (type === DiscountType.Percentage) {
      return 'نسبة مئوية';
    } else if (type === DiscountType.FixedAmount) {
      return 'مبلغ ثابت';
    }
    
    return `نوع آخر (${type})`;
  };
  // تحويل نطاق الخصم إلى نص للعرض
const getDiscountScopeText = (discount: Discount) => {
    // طباعة قيمة scope ونوعها لتشخيص المشكلة
    console.log(`Render discount ${discount.id}: scope=${discount.scope}, type=${typeof discount.scope}`);
    
    // التعامل مع جميع الحالات المحتملة
    if (discount.scope === undefined || discount.scope === null) {
      return 'غير محدد';
    }
    
    // التعامل مع القيم النصية المعادة من الخادم
    if (typeof discount.scope === 'string') {
      if (discount.scope === 'AllProducts') return 'جميع المنتجات';
      if (discount.scope === 'Category') return `فئة: ${discount.categoryName || 'غير محددة'}`;
      if (discount.scope === 'Product') {
        const productCount = discount.products?.length || 0;
        return `منتجات محددة (${productCount})`;
      }
      
      // محاولة تحويل النص إلى رقم
      const numericScope = parseInt(discount.scope, 10);
      if (!isNaN(numericScope)) {
        // استخدام القيمة الرقمية المحولة
        if (numericScope === DiscountScope.AllProducts) return 'جميع المنتجات';
        if (numericScope === DiscountScope.Category) return `فئة: ${discount.categoryName || 'غير محددة'}`;
        if (numericScope === DiscountScope.Product) {
          const productCount = discount.products?.length || 0;
          return `منتجات محددة (${productCount})`;
        }
      }
      
      // إذا لم نتمكن من معالجة القيمة، نعرض القيمة الأصلية
      return `نطاق: ${discount.scope}`;
    }
    
    // القيم العددية
    if (discount.scope === DiscountScope.AllProducts) {
      return 'جميع المنتجات';
    } else if (discount.scope === DiscountScope.Category) {
      return `فئة: ${discount.categoryName || 'غير محددة'}`;
    } else if (discount.scope === DiscountScope.Product) {
      const productCount = discount.products?.length || 0;
      return `منتجات محددة (${productCount})`;
    }
    
    return `نطاق آخر (${discount.scope})`;
  };

  // تحويل القيمة إلى نص مع الوحدة المناسبة
  const getDiscountValueText = (discount: Discount) => {
    const numericType = typeof discount.type === 'string' 
      ? parseInt(discount.type, 10) 
      : discount.type;
    
    return `${discount.value}${numericType === DiscountType.Percentage ? '%' : ' ريال'}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 rtl">
      <h1 className="text-2xl font-bold mb-6">إدارة الخصومات</h1>
      
      {/* نموذج إضافة/تعديل الخصم */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {selectedDiscount ? 'تعديل الخصم' : 'إضافة خصم جديد'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الحقول الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">اسم الخصم</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">الحالة</label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleCheckboxChange}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="mr-2">نشط</span>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">الوصف</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          
          {/* تفاصيل الخصم */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">نوع الخصم</label>
              <select
                name="type"
                value={formData.type?.toString() || '0'}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value={DiscountType.Percentage.toString()}>نسبة مئوية</option>
                <option value={DiscountType.FixedAmount.toString()}>مبلغ ثابت</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">قيمة الخصم</label>
              <input
                type="number"
                name="value"
                value={formData.value || 0}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {Number(formData.type) === DiscountType.Percentage ? '% نسبة مئوية' : 'قيمة بالريال'}
              </p>
            </div>
          </div>
          
          {/* نطاق الخصم */}
          <div>
            <label className="block text-sm font-medium text-gray-700">نطاق تطبيق الخصم</label>
            <select
              name="scope"
              value={formData.scope?.toString() || '0'}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value={DiscountScope.AllProducts.toString()}>جميع المنتجات</option>
              <option value={DiscountScope.Category.toString()}>فئة محددة</option>
              <option value={DiscountScope.Product.toString()}>منتجات محددة</option>
            </select>
          </div>
          
          {/* حقول إضافية تظهر حسب نطاق الخصم */}
          {Number(formData.scope) === DiscountScope.Category && (
            <div>
              <label className="block text-sm font-medium text-gray-700">الفئة</label>
              <select
                name="categoryName"
                value={formData.categoryName || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              >
                <option value="">اختر الفئة</option>
                {PRODUCT_CATEGORIES.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
          
          {Number(formData.scope) === DiscountScope.Product && (
            <div>
              <label className="block text-sm font-medium text-gray-700">المنتجات</label>
              <div className="mt-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {products.map(product => {
                  const isSelected = formData.products?.some(p => p.productId === product.id);
                  return (
                    <div key={product.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        checked={isSelected}
                        onChange={() => {
                          const currentProducts = formData.products || [];
                          let newProducts;
                          
                          if (isSelected) {
                            // إزالة المنتج
                            newProducts = currentProducts.filter(p => p.productId !== product.id);
                          } else {
                            // إضافة المنتج
                            newProducts = [...currentProducts, { productId: product.id }];
                          }
                          
                          setFormData(prev => ({ ...prev, products: newProducts }));
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor={`product-${product.id}`} className="mr-2 text-sm">{product.name}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* تواريخ بداية ونهاية الخصم */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">تاريخ البدء</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">تاريخ الانتهاء</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
          
          {/* أزرار التحكم */}
          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'جاري الحفظ...' : (selectedDiscount ? 'تحديث الخصم' : 'إضافة الخصم')}
            </button>
          </div>
        </form>
      </div>
      
      {/* قائمة الخصومات */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">قائمة الخصومات</h2>
        
        {loading && discounts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
        ) : discounts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا توجد خصومات</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع الخصم
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
                  <tr key={discount.id}>
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
                        className="text-indigo-600 hover:text-indigo-900 ml-4"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

export default DiscountsManagement;