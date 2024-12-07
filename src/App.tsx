import React from 'react';
import {  Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/home/home';
import AboutUs from './pages/about-us/about-us';
import './index.css';
import ContactMe from './pages/contact-me/contact-me';
import WhatsAppButton from './components/WhatsAppButton';



const App: React.FC = () => {
  return (
    <div dir="rtl" className="font-sans">
    <Header />
    
    <main className="container mx-auto px-4 py-8">
      <Routes>
      <Route path="/Home" element={<Navigate to="/home" replace />} />

        <Route path="/home" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-me" element={<ContactMe />} />
      </Routes>
    </main>

    <WhatsAppButton />

      
    
    </div>
  );
};

export default App;