import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../typerScript/useProducts';
import { dummyProducts } from '../typerScript/useProducts';
import { Product } from '../types/product';
import { useCart, CartItem } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

export const useHome = () => {
  const navigate = useNavigate();
  const { currentImageIndex, nextImage, prevImage, setCurrentImageIndex } = useProducts();
  const { state, dispatch } = useCart();
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  useEffect(() => {
    setFavorites(favoritesState.items.map(item => item.id));
  }, [favoritesState.items]);

  const handleFavorite = (product: Product) => {
    const isLoggedIn = !!currentUser;
    
    if (!isLoggedIn) {
      navigate('/favorites');
      return;
    }

    const isFavorite = favorites.includes(product.id);
    
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
          image: product.images[currentImageIndex[product.id] || 0],
          userId: currentUser?.id
        } 
      });
      setFavorites(prev => [...prev, product.id]);
    }
  };

  const handleAddToCart = (product: Product) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        category: product.category,
        name: product.name,
        price: product.price,
        image: product.images[currentImageIndex[product.id] || 0],
        quantity: 1
      }
    });
  };

  const isProductAvailable = (product: Product): boolean => {
    const cartItem = state.items.find((item: CartItem) => item.id === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    return cartQuantity < product.stock;
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const filteredProducts = selectedCategory
    ? dummyProducts.filter(product => product.category === selectedCategory)
    : dummyProducts;

  const uniqueCategories = Array.from(new Set(dummyProducts.map(product => product.category)));

  return {
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
    uniqueCategories
  };
};