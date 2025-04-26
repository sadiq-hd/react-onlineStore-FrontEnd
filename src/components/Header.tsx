import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import headerlogo from '../assets/headerlogo.png';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useProductManagement } from '../typerScript/useProductManagement';

const Header: React.FC = () => {
  const { state, resetCart } = useCart();
  const { state: favoritesState, resetFavorites } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // استخدام حالة البحث من useProductManagement
  const { searchQuery, setSearchQuery } = useProductManagement();
  
  const cartItemsCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const favoritesCount = favoritesState.items.length;
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const isAdmin = currentUser?.role === 'admin';

  // فتح البحث تلقائياً عندما يكون هناك استعلام بحث في الـ URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam && location.pathname === '/products') {
      // افتح البحث في حالة تصفح صفحة المنتجات مع وجود استعلام بحث
      setIsSearchOpen(true);
    }
  }, [location.search, location.pathname]);

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // إغلاق قائمة المستخدم عند النقر خارجها
      if (isUserMenuOpen && !(event.target as Element).closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      
      // إغلاق البحث عند النقر خارجه
      if (isSearchOpen && !(event.target as Element).closest('.search-container')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isSearchOpen]);

  // التركيز على حقل البحث عندما يُفتح
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // إغلاق البحث عند تغيير المسار ما عدا صفحة المنتجات
  useEffect(() => {
    if (!location.pathname.includes('/products')) {
      setIsSearchOpen(false);
    }
  }, [location.pathname]);

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };
  
  const isActive = (path: string) => location.pathname === path;

  // تعديل دالة البحث لتعمل مع useNavigate وحالة البحث من useProductManagement
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      
      // لا نقوم بمسح محتوى البحث عند الانتقال إلى صفحة المنتجات
      // لكن نغلق نموذج البحث في الأجهزة المحمولة
      if (window.innerWidth < 768) {
        setIsSearchOpen(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      // حذف بيانات المستخدم
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      
      // إعادة تعيين السلة والمفضلة
      await Promise.all([
        resetCart(),
        resetFavorites()
      ]);

      // تحديث الصفحة والتوجيه للرئيسية
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-purple-500 sticky top-0 z-50">
      {/* شريط الإشعارات */}
      <div className="bg-red-500 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-center flex-1">
              هذا الموقع تجريبي وليس متجرًا فعليًا. جميع العمليات هنا للاختبار فقط. جميع البيانات محمية ومشفرة 
            </p>
            {/* إشعار خاص (تخفيضات، عروض جديدة، إلخ) */}
            <div className="hidden md:block">
              <span className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded animate-pulse">
                عروض جديدة!
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/">
              <img 
                src={headerlogo}
                alt="Logo" 
                className="h-10 w-auto animate-spin-slow"
              />
            </Link>
          </div>

          {/* Main Navigation - Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-8 space-x-reverse">
              <Link 
                to="/" 
                className={`text-white text-base font-medium transition-all duration-300 border-b-2 
                          ${isActive('/') ? 'border-white' : 'border-transparent hover:border-white/50'} 
                          py-2 px-1`}
              >
                الرئيسية
              </Link>
              <Link 
                to="/products"
                className={`text-white text-base font-medium transition-all duration-300 border-b-2 
                          ${isActive('/products') ? 'border-white' : 'border-transparent hover:border-white/50'} 
                          py-2 px-1`}
              >
                المنتجات
              </Link>
              <Link 
                to="/FAQs"
                className={`text-white text-base font-medium transition-all duration-300 border-b-2 
                          ${isActive('/FAQs') ? 'border-white' : 'border-transparent hover:border-white/50'} 
                          py-2 px-1`}
              >
                الاسئلة الشائعة
              </Link>
              <Link 
                to="/about-us"
                className={`text-white text-base font-medium transition-all duration-300 border-b-2 
                          ${isActive('/about-us') ? 'border-white' : 'border-transparent hover:border-white/50'} 
                          py-2 px-1`}
              >
                من نحن
              </Link>
              <Link 
                to="/contact-me"
                className={`text-white text-base font-medium transition-all duration-300 border-b-2 
                          ${isActive('/contact-me') ? 'border-white' : 'border-transparent hover:border-white/50'} 
                          py-2 px-1`}
              >
                اتصل بنا
              </Link>
            </div>
          </div>

          {/* Right Section - User Menu & Cart */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse">
            {/* Search Button & Form */}
            <div className="relative search-container">
              
               
           
  
              
            </div>

            {/* Favorites Link */}
            <Link to="/favorites" className="text-white hover:text-blue-100 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="text-white hover:text-blue-100 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative user-menu-container">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-white hover:text-blue-100 transition-colors flex items-center space-x-2 space-x-reverse"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{currentUser ? currentUser.name : 'حسابي'}</span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 text-sm border-b border-gray-200">
                        <p className="font-medium text-gray-900">مرحباً،</p>
                        <p className="text-gray-600">{currentUser.name}</p>
                      </div>
                      <Link to="/profile" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                        الملف الشخصي
                      </Link>
                      <Link to="/orders" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                        طلباتي
                      </Link>
                      <Link to="/favorites" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                        المفضلة
                      </Link>

                      {isAdmin && (
                        <>
                          <div className="px-4 py-2 mt-2 border-t border-gray-200 text-xs font-semibold text-gray-400 uppercase">
                            لوحة الإدارة
                          </div>
                          <Link to="/admin/products" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                            إدارة المنتجات
                          </Link>
                          <Link to="/admin/AdminDashboard" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                            لوحة التحكم
                          </Link>
                          <Link to="/admin/AdminOrders" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                            طلبات الشراء
                          </Link>
                          <Link to="/admin/DiscountsManagement" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                            ادارة التخفيضات
                          </Link>
                          <Link to="/admin/AdminReviewsPage" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                            إدارة المراجعات
                          </Link>
                          <Link to="/admin/AdminCommentsPage" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                            إدارة التعليقات
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-gray-200 mt-2"></div>
                      <button 
                        onClick={() => {
                          handleLogout();
                          closeMenus();
                        }}
                        className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        تسجيل الخروج
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/signin" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                        تسجيل الدخول
                      </Link>
                      <Link to="/register" onClick={closeMenus} className="block px-4 py-2 text-gray-800 hover:bg-purple-100 hover:text-purple-700">
                        إنشاء حساب
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4 space-x-reverse">
          

            {/* Favorites Link - Mobile */}
            <Link to="/favorites" className="text-white hover:text-blue-100 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart Link - Mobile */}
            <Link to="/cart" className="text-white hover:text-blue-100 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Menu Toggle - Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-100 transition-colors duration-300"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen 
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

     

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-400">
            <Link to="/" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">الرئيسية</Link>
            <Link to="/products" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">المنتجات</Link>
            <Link to="/FAQs" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">الاسئلة الشائعة</Link>
            <Link to="/about-us" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">من نحن</Link>
            <Link to="/contact-me" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">اتصل بنا</Link>
            <hr className="my-2 border-blue-400" />
            {currentUser ? (
              <>
                <div className="py-2.5 text-white px-4">مرحباً، {currentUser.name}</div>
                <Link to="/profile" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                  الملف الشخصي
                </Link>
                <Link to="/orders" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                  طلباتي
                </Link>
                <Link to="/favorites" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                  المفضلة
                </Link>

                {isAdmin && (
                  <>
                    <div className="mt-3 mb-1 px-4 text-xs font-semibold text-blue-200 uppercase">
                      لوحة الإدارة
                    </div>
                    <Link to="/admin/products" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                      إدارة المنتجات
                    </Link>
                    <Link to="/admin/AdminDashboard" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                      لوحة التحكم
                    </Link>
                    <Link to="/admin/AdminOrders" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                      طلبات الشراء
                    </Link>
                    <Link to="/admin/DiscountsManagement" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                      ادارة التخفيضات
                    </Link>
                    <Link to="/admin/AdminReviewsPage" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                      إدارة المراجعات
                    </Link>
                    <Link to="/admin/AdminCommentsPage" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                      إدارة التعليقات
                    </Link>
                  </>
                )}

                <hr className="my-2 border-blue-400" />
                <button 
                  onClick={() => {
                    handleLogout();
                    closeMenus();
                  }}
                  className="w-full text-right py-2.5 text-white px-4 hover:bg-red-600 rounded-lg"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                  تسجيل الدخول
                </Link>
                <Link to="/register" onClick={closeMenus} className="block py-2.5 text-white hover:bg-purple-500 px-4 rounded-lg mb-1">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;