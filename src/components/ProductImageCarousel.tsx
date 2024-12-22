import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

    if (!images?.length) return null;

    return (
        <div className="relative w-full h-48 group overflow-hidden">
            <div className={`w-full h-full transform transition-transform duration-300 ease-out ${isAnimating ? 'scale-95' : 'scale-100'}`}>
                <img
                    src={`https://localhost:5000${images[currentIndex].imageUrl}`}
                    alt={`${productName} - Image ${currentIndex + 1}`}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                />
            </div>
            
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                    >
                        <ChevronRight size={20} />
                    </button>

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
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductImageCarousel;