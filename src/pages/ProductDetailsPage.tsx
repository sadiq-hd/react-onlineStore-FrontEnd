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
  Check,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import SaudiRiyal from "../assets/Saudi_Riyal.png";
import ReviewSection from '../components/reviews/ReviewSection';
import CommentSection from '../components/reviews/CommentSection';
import RatingStars from '../components/reviews/RatingStars';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'comments'>('overview');
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

  const toggleZoom = () => {
    setZoomedImage(!zoomedImage);
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
        {/* معرض الصور - تم تعديله ليكون بحجم ثابت */}
        <div>
          {/* صندوق الصورة الرئيسية بحجم ثابت */}
          <div className="relative mb-4 bg-gray-50 rounded-xl shadow-md overflow-hidden w-full md:w-[60%] mx-auto aspect-square">
          <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={product.images[selectedImage]?.imageUrl} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain cursor-zoom-in"
                onClick={toggleZoom}
              />
            </div>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 bg-white/70 p-2 rounded-full hover:bg-white transition-all z-10"
            >
              <Heart 
                className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
              />
            </button>
            {/* أيقونة تكبير */}
            <div className="absolute bottom-4 left-4 bg-white/70 px-2 py-1 rounded-full text-xs text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              انقر للتكبير
            </div>
          </div>

          {/* صور مصغرة */}
          <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto py-2">
            {product.images.map((img, index) => (
              <div 
                key={index}
                onClick={() => handleImageChange(index)}
                className={`min-w-[64px] w-16 h-16 rounded-lg cursor-pointer overflow-hidden border-2
                  ${selectedImage === index ? 'border-blue-500' : 'border-transparent opacity-70'}`}
              >
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <img 
                    src={img.imageUrl} 
                    alt={`${product.name} - صورة ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* معلومات المنتج */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          
          {/* التقييمات */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-500">
              <RatingStars 
                rating={product.averageRating ? Number(product.averageRating) : 0} 
                size="sm" 
              />
            </div>
            <span className="text-gray-600 text-sm">
              ({product.totalReviews || 0} تقييم)
            </span>
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
                disabled={quantity <= 1}
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold">-</span>
              </button>
              <span className="px-4">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange('increase')}
                className="p-2 hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold">+</span>
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

      {/* تبويبات المعلومات والتقييمات والتعليقات */}
      <div className="mt-10">
        <div className="border-b mb-6">
          <ul className="flex flex-wrap -mb-px">
            <li className="ml-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`inline-block py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'overview'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                نظرة عامة
              </button>
            </li>
            <li className="ml-4">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`inline-block py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'reviews'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                التقييمات ({product.totalReviews || 0})
              </button>
            </li>
            <li className="ml-4">
              <button
                onClick={() => setActiveTab('comments')}
                className={`inline-block py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'comments'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                التعليقات
              </button>
            </li>
          </ul>
        </div>

        {/* محتوى التبويب النشط */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3 text-xl">الوصف</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
              <div>
                <h3 className="font-medium mb-3 text-xl">المواصفات</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between py-2 border-b">
                    <span className="font-medium">التصنيف:</span>
                    <span>{product.category}</span>
                  </li>
                  <li className="flex justify-between py-2 border-b">
                    <span className="font-medium">المخزون:</span>
                    <span>{product.stock} قطعة</span>
                  </li>
                  {product.hasDiscount && (
                    <li className="flex justify-between py-2 border-b">
                      <span className="font-medium">الخصم:</span>
                      <span>
                        {product.discountType === 'Percentage' 
                          ? `${product.discountValue}%` 
                          : `${product.discountValue} ريال`}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewSection productId={product.id} />
          )}

          {activeTab === 'comments' && (
            <CommentSection productId={product.id} />
          )}
        </div>
      </div>

      {/* وضع تكبير الصورة - يظهر عند الضغط على الصورة */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-full">
            <button 
              onClick={toggleZoom}
              className="absolute top-0 right-0 bg-white/20 p-2 rounded-full text-white z-10 -m-4"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={product.images[selectedImage]?.imageUrl}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain mx-auto"
            />
            
            {/* شريط الصور المصغرة في وضع التكبير */}
            <div className="flex justify-center mt-4 gap-2 overflow-x-auto">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className={`w-16 h-16 rounded cursor-pointer overflow-hidden border-2
                    ${selectedImage === index ? 'border-white' : 'border-transparent opacity-50'}`}
                >
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <img 
                      src={img.imageUrl} 
                      alt={`${product.name} - صورة ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;