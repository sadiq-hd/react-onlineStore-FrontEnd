// src/hooks/useProducts.ts
import { useState } from 'react';
import { Product } from '../types/product';

export const useProducts = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});

  const nextImage = (productId: number, imagesLength: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imagesLength
    }));
  };

  const prevImage = (productId: number, imagesLength: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imagesLength) % imagesLength
    }));
  };

  return {
    currentImageIndex,
    nextImage,
    prevImage,
    setCurrentImageIndex
  };
};

export const dummyProducts: Product[] = [
    {
      id: 1,
      category: "سماعات",
      name: "سماعات لاسلكية",
      price: 299.99,
      stock: 3,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500"
      ],
      description: "سماعات بلوتوث عالية الجودة مع عزل للضوضاء"
    },
    {
      id: 2,
      category: "ساعات",
      name: "ساعة ذكية",
      price: 599.99,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500"
      ],
      description: "ساعة ذكية متعددة المزايا مع تتبع اللياقة البدنية"
    },
    {
      id: 3,
      category: "حقائب",
      name: "حقيبة لابتوب",
      price: 199.99,
      stock: 100,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500",
        "https://images.unsplash.com/photo-1576595580361-90a855b84b20?w=500"
      ],
      description: "حقيبة لابتوب أنيقة ومقاومة للماء"
    },
    {
      id: 4,
      category: "شواحن",
      name: "شاحن متنقل",
      price: 149.99,
      stock: 75,
      images: [
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
        "https://images.unsplash.com/photo-1585338647529-03d363fe9ace?w=500",
        "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500"
      ],
      description: "شاحن متنقل سعة 20000mAh مع شحن سريع"
    },
    {
      id: 5,
      category: "مستلزمات الكمبيوتر",
      name: "كيبورد ميكانيكي",
      price: 399.99,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500",
        "https://images.unsplash.com/photo-1595225476474-488a00f9c5b4?w=500"
      ],
      description: "لوحة مفاتيح ميكانيكية مع إضاءة RGB"
    },
    {
      id: 6,
      category: "مستلزمات الكمبيوتر",
      name: "ماوس للألعاب",
      price: 249.99,
      stock: 60,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500",
        "https://images.unsplash.com/photo-1588931731810-bcbe8624f1eb?w=500"
      ],
      description: "ماوس احترافي للألعاب مع دقة عالية"
    },
    {
      id: 7,
      category: "مستلزمات الكمبيوتر",

      name: "مكبر صوت بلوتوث",
      price: 179.99,
      stock: 85,
      images: [
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500",
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        "https://images.unsplash.com/photo-1612198273689-c47e28514ced?w=500"
      ],
      description: "سماعة بلوتوث محمولة مع صوت ستيريو قوي"
    }
  ];

