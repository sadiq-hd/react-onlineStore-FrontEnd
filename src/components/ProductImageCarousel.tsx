import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_CONFIG, formatImageUrl } from '../config/apiConfig';

interface ProductImage {
    imageUrl: string;
    id?: number;
}

interface ProductImageCarouselProps {
    images: ProductImage[];
    productName: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images, productName }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const goToPrevious = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const goToNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
        setTimeout(() => setIsAnimating(false), 300);
    };

    // معالجة حالة عدم وجود صور
    if (!images?.length) {
        return (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">لا توجد صور متاحة</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-48 group overflow-hidden">
            {/* صورة المنتج */}
            <div 
                className={`w-full h-full transform transition-transform duration-300 ease-out ${
                    isAnimating ? 'scale-95' : 'scale-100'
                }`}
            >
                <img
                    src={formatImageUrl(images[currentIndex].imageUrl)}
                    alt={`${productName} - صورة ${currentIndex + 1}`}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                        console.error('فشل تحميل الصورة:', images[currentIndex].imageUrl);
                        e.currentTarget.src = API_CONFIG.FALLBACK_IMAGE;
                    }}
                />
            </div>

            {/* أزرار التنقل - تظهر فقط إذا كان هناك أكثر من صورة */}
            {images.length > 1 && (
                <>
                    {/* زر السابق */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                        aria-label="الصورة السابقة"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* زر التالي */}
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                        aria-label="الصورة التالية"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* نقاط التنقل */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (isAnimating) return;
                                    setIsAnimating(true);
                                    setCurrentIndex(idx);
                                    setTimeout(() => setIsAnimating(false), 300);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-150
                                    ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/60'}`}
                                aria-label={`انتقل إلى الصورة ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductImageCarousel;