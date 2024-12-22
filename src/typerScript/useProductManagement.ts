import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { 
   CreateProductDto, 
   Product, 
   ProductCategory,
   PRODUCT_CATEGORIES
} from '../types/product';
import { productService } from '../services/productService';
import { useCart, CartItem } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

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

   const { state: cartState, dispatch: cartDispatch } = useCart();
   const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites();
   const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

   // تحديث المفضلة
   useEffect(() => {
       setFavorites(favoritesState.items.map(item => item.id));
   }, [favoritesState.items]);

   // التحكم في عرض الصور
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

   // إضافة للمفضلة
   const handleFavorite = (product: Product) => {
       if (!currentUser) {
           navigate('/login');
           return;
       }

       const isFavorite = favorites.includes(product.id);
       const productImage = product.images[0]?.imageUrl || '';
       
       if (isFavorite) {
           favoritesDispatch({ type: 'REMOVE_FAVORITE', payload: product.id });
           setFavorites(prev => prev.filter(id => id !== product.id));
       } else {
           favoritesDispatch({
               type: 'ADD_FAVORITE',
               payload: {
                   id: product.id,
                   name: product.name,
                   price: product.price,
                   image: productImage,
                   userId: currentUser?.id
               }
           });
           setFavorites(prev => [...prev, product.id]);
       }
   };

   // إضافة للسلة
   const handleAddToCart = (product: Product) => {
       if (!isProductAvailable(product)) return;
       
       const productImage = product.images[0]?.imageUrl || '';
       cartDispatch({
           type: 'ADD_ITEM',
           payload: {
               id: product.id,
               category: product.category,
               name: product.name,
               price: product.price,
               image: productImage,
               quantity: 1
           }
       });
   };

   // التحقق من توفر المنتج
   const isProductAvailable = (product: Product): boolean => {
       const cartItem = cartState.items.find((item: CartItem) => item.id === product.id);
       const cartQuantity = cartItem ? cartItem.quantity : 0;
       return cartQuantity < product.stock;
   };

   // تغيير التصنيف
   const handleCategoryChange = (category: ProductCategory | null) => {
       setSelectedCategory(category);
   };

   // فلترة المنتجات
   const filteredProducts = products.filter(product => {
       // فلترة حسب التصنيف
       if (selectedCategory && product.category !== selectedCategory) {
           return false;
       }
       
       // فلترة حسب البحث
       if (searchQuery) {
           const searchLower = searchQuery.toLowerCase();
           return (
               product.name.toLowerCase().includes(searchLower) ||
               product.description.toLowerCase().includes(searchLower)
           );
       }
       
       return true;
   });

   // جلب المنتجات
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

   // البحث
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

   // إضافة منتج
   const addProduct = async (productData: CreateProductDto, files: File[]) => {
       try {
           setLoading(true);
           const newProduct = await productService.addProduct(productData);
           if (files.length > 0 && newProduct.id) {
               await Promise.all(files.map(file => 
                   productService.addProductImage(newProduct.id, file)
               ));
           }
           await fetchProducts();
           return true;
       } catch (err) {
           setError('فشل في إضافة المنتج');
           console.error('Error adding product:', err);
           return false;
       } finally {
           setLoading(false);
       }
   };

   // تحديث منتج
   const updateProduct = async (id: number, productData: CreateProductDto, files: File[]) => {
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

   // حذف منتج
   const deleteProduct = async (id: number) => {
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

   // تحميل المنتجات عند بدء التطبيق
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
       isProductAvailable,
       handleCategoryChange,
       filteredProducts,
       PRODUCT_CATEGORIES,
       addProduct,
       deleteProduct,
       updateProduct,
       searchQuery,
       setSearchQuery,
       refreshProducts: fetchProducts
   };
};