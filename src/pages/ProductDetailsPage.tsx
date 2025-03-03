import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { Product } from '../types/product';
import { 
  Heart, 
  Star, 
  Share2, 
  ShoppingCart, 
  Truck, 
  ArrowLeft, 
  ArrowRight,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import SaudiRiyal from "../assets/Saudi_Riyal.png";

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const cartContext = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          // البحث عن المنتج ضمن قائمة المنتجات مع الخصومات
          const productsWithDiscounts = await productService.getProductsWithDiscounts();
          const productWithDiscount = productsWithDiscounts.find(p => p.id === Number(id));
          
          if (productWithDiscount) {
            setProduct(productWithDiscount);
          } else {
            // إذا لم يتم العثور على المنتج ضمن القائمة، استخدم الطريقة العادية
            const fetchedProduct = await productService.getProductById(Number(id));
            setProduct(fetchedProduct);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('حدث خطأ في جلب تفاصيل المنتج');
      }
    };

    fetchProduct();
  }, [id]);

  const handleShare = async () => {
    if (!product) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `شاهد هذا المنتج: ${product.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('خطأ في المشاركة:', error);
        toast.error('حدث خطأ أثناء المشاركة');
      }
    } else {
      // fallback للمتصفحات التي لا تدعم Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ رابط المنتج');
      } catch (error) {
        console.error('خطأ في نسخ الرابط:', error);
        toast.error('حدث خطأ أثناء نسخ الرابط');
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
      
      // استخدام addToCart من سياق السلة
      await cartContext.addToCart(product.id, quantity);
      
      // عرض رسالة نجاح
      toast.success(`تمت إضافة ${quantity} من ${product.name} للسلة`, {
        position: "bottom-right",
        autoClose: 3000,
      });

      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج للسلة');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  const handleImageChange = (index: number) => {
    setSelectedImage(index);
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase' && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderStockStatus = () => {
    if (product.stock > 10) {
      return (
        <span className="text-green-600 font-medium text-sm flex items-center gap-1">
          <Truck className="w-4 h-4" />
          متوفر للشحن
        </span>
      );
    } else if (product.stock > 0) {
      return (
        <span className="text-yellow-600 font-medium text-sm">
          كمية محدودة ({product.stock} متبقي)
        </span>
      );
    } else {
      return (
        <span className="text-red-600 font-medium text-sm">
          نفذ المخزون
        </span>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 rtl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* معرض الصور */}
        <div>
          <div className="relative mb-4">
            <img 
              src={product.images[selectedImage]?.imageUrl} 
              alt={product.name} 
              className="w-full h-[400px] object-cover rounded-xl shadow-md"
            />
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 bg-white/70 p-2 rounded-full hover:bg-white transition-all"
            >
              <Heart 
                className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
              />
            </button>
          </div>

          {/* صور مصغرة */}
          <div className="flex space-x-2 rtl:space-x-reverse">
            {product.images.map((img, index) => (
              <img 
                key={index}
                src={img.imageUrl} 
                alt={`${product.name} - صورة ${index + 1}`}
                onClick={() => handleImageChange(index)}
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer 
                  ${selectedImage === index ? 'border-2 border-blue-500' : 'opacity-70'}`}
              />
            ))}
          </div>
        </div>

        {/* معلومات المنتج */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < 4 ? 'fill-yellow-500' : ''}`} 
                />
              ))}
            </div>
            <span className="text-gray-600 text-sm">(4 تقييمات)</span>
          </div>

          <div className="mb-4">
            {product.hasDiscount ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <p className="text-lg line-through text-gray-500">
                    {product.price.toLocaleString('ar-SA')}
                  </p>
                  <img src={SaudiRiyal} alt="SAR" className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-green-600">
                    {product.discountedPrice?.toLocaleString('ar-SA')}
                  </p>
                  <img src={SaudiRiyal} alt="SAR" className="w-6 h-6" />
                  <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full ml-2">
                    {product.discountType === 'Percentage' ? 
                      `${product.discountValue}%` : 
                      `خصم ${product.discountValue} ريال`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {product.price.toLocaleString('ar-SA')}
                </p>
                <img src={SaudiRiyal} alt="SAR" className="w-6 h-6" />
              </div>
            )}
            {renderStockStatus()}
          </div>

          <p className="text-gray-600 mb-4">{product.description}</p>

          {/* خيارات الكمية */}
          <div className="flex items-center gap-4 mb-4">
            <span>الكمية:</span>
            <div className="flex items-center border rounded-lg">
              <button 
                onClick={() => handleQuantityChange('decrease')}
                className="p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="px-4">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange('increase')}
                className="p-2 hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* أزرار الإضافة والمشاركة */}
          <div className="flex gap-4">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white 
                ${product.stock > 0 && !isAddingToCart
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {isAddingToCart ? (
                <span className="animate-spin">
                  <Check className="w-5 h-5" />
                </span>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  إضافة للسلة
                </>
              )}
            </button>
            <button 
              onClick={() => handleShare()}
              className="flex items-center justify-center gap-2 px-6 py-3 
              rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              <Share2 className="w-5 h-5" />
              مشاركة
            </button>
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="mt-12">
        <div className="border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">تفاصيل المنتج</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">الوصف</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">المواصفات</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <span className="font-medium">التصنيف:</span> {product.category}
              </li>
              <li>
                <span className="font-medium">المخزون:</span> {product.stock} قطعة
              </li>
              {product.hasDiscount && (
                <li>
                  <span className="font-medium">الخصم:</span> {' '}
                  {product.discountType === 'Percentage' 
                    ? `${product.discountValue}%` 
                    : `${product.discountValue} ريال`}
                </li>
              )}
              {/* يمكنك إضافة المزيد من التفاصيل هنا */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;