import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/home/home';
import AboutUs from './pages/about-us/about-us';
import './index.css';
import ContactMe from './pages/contact-me/contact-me';
import WhatsAppButton from './components/WhatsAppButton';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Register from './pages/auth/Register';
import Signin from './pages/auth/Signin';

const App: React.FC = () => {
  return (
    <CartProvider>

    <div dir="rtl" className="font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* توجيه المسار الجذر إلى /home */}
          
          {/* المسارات الأخرى */}
        <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-me" element={<ContactMe />} />
          <Route path="/cart" element={<Cart />} />

          <Route path='/register' element={<Register/>} />
          <Route path='/signin' element={<Signin/>} />

          </Routes>
      </main>

      <WhatsAppButton />
    </div>
    </CartProvider>

  );
};

export default App;