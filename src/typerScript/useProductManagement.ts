import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { CreateProductDto, Product, ProductCategory } from '../types/product';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useFavorites } from './useFavorites';

export const useProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const { state: cartState, addToCart } = useCart();
  const { state: favoritesState, addToFavorites, removeFromFavorites } = useFavorites();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  const addProduct = async (productData: CreateProductDto, files: File[]): Promise<boolean> => {
    try {
      setLoading(true);
      const newProduct = await productService.addProduct(productData);
      
      if (files.length > 0 && newProduct.id) {
        const imagePromises = files.map(file => productService.addProductImage(newProduct.id, file));
        await Promise.all(imagePromises);
      }
      
      await fetchProducts();
      return true;
    } catch (err) {
      console.error('Error in addProduct:', err);
      setError('فشل في إضافة المنتج');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, productData: CreateProductDto, files: File[]): Promise<boolean> => {
    try {
      setLoading(true);
      await productService.updateProduct(id, productData);
      if (files.length > 0) {
        await Promise.all(files.map(file => 
          productService.addProductImage(id, file)
        ));
      }
      await fetchProducts();
      return true;
    } catch (err) {
      setError('فشل في تحديث المنتج');
      console.error('Error updating product:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await productService.deleteProduct(id);
      await fetchProducts();
      return true;
    } catch (err) {
      setError('فشل في حذف المنتج');
      console.error('Error deleting product:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFavorites(favoritesState.items.map(item => item.id));
  }, [favoritesState.items]);

  const nextImage = (productId: number, imagesLength: number) => {
    if (imagesLength <= 1) return;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imagesLength
    }));
  };

  const prevImage = (productId: number, imagesLength: number) => {
    if (imagesLength <= 1) return;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imagesLength) % imagesLength
    }));
  };

  const handleFavorite = async (product: Product) => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    try {
      if (favorites.includes(product.id)) {
        await removeFromFavorites(product.id);
        setFavorites(prev => prev.filter(id => id !== product.id));
      } else {
        await addToFavorites(product.id);
        setFavorites(prev => [...prev, product.id]);
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (!isProductAvailable(product)) {
      setError('المنتج غير متوفر حالياً');
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('فشل في إضافة المنتج إلى السلة');
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/signin');
      return false;
    }
    return true;
  };

  const isProductAvailable = (product: Product): boolean => {
    const cartItem = cartState.items.find(item => item.productId === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    return cartQuantity < product.stock;
  };

  const handleCategoryChange = (category: ProductCategory | null) => {
    setSelectedCategory(category);
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل المنتجات');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedQuery) {
        try {
          setLoading(true);
          const data = await productService.searchProducts({
            query: debouncedQuery,
            category: selectedCategory || undefined
          });
          setProducts(data);
        } catch (err) {
          setError('فشل في البحث عن المنتجات');
          console.error(err);
        } finally {
            setLoading(false);
        }
      } else {
        fetchProducts();
      }
    };
    

    handleSearch();
  }, [debouncedQuery, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    currentImageIndex,
    nextImage,
    prevImage,
    setCurrentImageIndex,
    favorites,
    selectedCategory,
    handleFavorite,
    handleAddToCart,
    handleCheckout,
    isProductAvailable,
    handleCategoryChange,
    filteredProducts,
    searchQuery,
    setSearchQuery,
    refreshProducts: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
};