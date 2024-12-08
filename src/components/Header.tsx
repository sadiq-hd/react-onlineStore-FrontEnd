import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import reactLogo from '../assets/react.svg';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const { state } = useCart();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const cartItemsCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <img 
              src={reactLogo}
              alt="Logo" 
              className="h-10 w-auto animate-spin-slow"
            />
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
            {/* Search Button */}
            <button className="text-white hover:text-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

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
            <div className="relative">
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
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 text-sm border-b border-gray-200">
                        <p className="font-medium text-gray-900">مرحباً،</p>
                        <p className="text-gray-600">{currentUser.name}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        الملف الشخصي
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        طلباتي
                      </Link>
                      <Link to="/favorites" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        المفضلة
                      </Link>
                      {currentUser.role === 'admin' && (
                        <Link to="/admin-dashboard" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                          لوحة التحكم
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full text-right px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        تسجيل الخروج
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        تسجيل الدخول
                      </Link>
                      <Link to="/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
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
            <Link to="/" className="block py-2.5 text-white text-center hover:bg-blue-500">الرئيسية</Link>
            <Link to="/products" className="block py-2.5 text-white text-center hover:bg-blue-500">المنتجات</Link>
            <Link to="/about-us" className="block py-2.5 text-white text-center hover:bg-blue-500">من نحن</Link>
            <Link to="/contact-me" className="block py-2.5 text-white text-center hover:bg-blue-500">اتصل بنا</Link>
            <hr className="my-2 border-blue-400" />
            {currentUser ? (
              <>
                <div className="py-2.5 text-white text-center">مرحباً، {currentUser.name}</div>
                <Link to="/profile" className="block py-2.5 text-white text-center hover:bg-blue-500">الملف الشخصي</Link>
                <Link to="/orders" className="block py-2.5 text-white text-center hover:bg-blue-500">طلباتي</Link>
                {currentUser.role === 'admin' && (
                  <Link to="/admin-dashboard" className="block py-2.5 text-white text-center hover:bg-blue-500">
                    لوحة التحكم
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 text-white text-center hover:bg-blue-500"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2.5 text-white text-center hover:bg-blue-500">تسجيل الدخول</Link>
                <Link to="/register" className="block py-2.5 text-white text-center hover:bg-blue-500">إنشاء حساب</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;