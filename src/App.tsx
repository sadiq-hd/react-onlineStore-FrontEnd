import { FC } from 'react';
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
import Profile from './pages/profile/Profile';
import Favorites from './pages/Favorites/Favorites';
import { FavoritesProvider } from './context/FavoritesContext';
import FAQs from './pages/FAQs';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement/ProductManagement';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/orderes/OrderDetails';
import UserOrders from './pages/orderes/UserOrders';
import AdminOrders from './pages/orderes/AdminOrders';
import PrivateRoute from './PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AdminOrderDetails from './pages/orderes/AdminOrderDetails';
import DiscountsManagement from './pages/DiscountsManagement';
import ForgotPassword from './pages/auth/ForgotPassword';

// صفحات الخصومات وأكواد الخصم الجديدة


const App: FC = () => {
  return (
    <CartProvider>
      <FavoritesProvider>
        <div dir="rtl" className="font-sans">
          <ToastContainer 
            position="top-center" 
            rtl={true}
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
    
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* المسارات العامة */}
              <Route path="/" element={<Home />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-me" element={<ContactMe />} />
              <Route path="/FAQs" element={<FAQs />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/forgotpassword" element={<ForgotPassword/>} />
              <Route path="/product/:id" element={<ProductDetailsPage/>}/>              
              {/* مسارات تسمح للزوار */}
              <Route
                path="/cart"
                element={
                  <PrivateRoute allowGuest={true}>
                    <Cart />
                  </PrivateRoute>
                }
              />

              {/* مسارات تتطلب تسجيل الدخول */}
              <Route
                path="/checkout"
                element={
                  <PrivateRoute allowGuest={false}>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              
              {/* مسارات الطلبات للمستخدم العادي */}
              <Route
                path="/UserOrders"
                element={
                  <PrivateRoute>
                    <UserOrders />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/orders/:id"
                element={
                  <PrivateRoute>
                    <OrderDetails />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/favorites"
                element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                }
              />

              {/* مسارات المشرف */}
              <Route
                path="/admin/AdminDashboard"
                element={
                  <PrivateRoute adminOnly>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/products"
                element={
                  <PrivateRoute adminOnly>
                    <ProductManagement />
                  </PrivateRoute>
                }
              />

              {/* مسارات الطلبات للمشرف */}
              <Route
                path="/admin/AdminOrders"
                element={
                  <PrivateRoute adminOnly>
                    <AdminOrders />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/admin/AdminOrderDetails/:id"
                element={
                  <PrivateRoute adminOnly>
                    <AdminOrderDetails />
                  </PrivateRoute>
                }
              />

<Route
                path="/admin/DiscountsManagement"
                element={
                  <PrivateRoute adminOnly>
                    <DiscountsManagement />
                  </PrivateRoute>
                }
              />
              
         
              
         
            </Routes>
          </main>

          <Footer />
          <WhatsAppButton />
        </div>
      </FavoritesProvider>
    </CartProvider>
  );
};

export default App;