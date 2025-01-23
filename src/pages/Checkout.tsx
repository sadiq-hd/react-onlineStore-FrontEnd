import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { CreateOrderDto, PaymentMethodType, DeliveryAddress } from '../typerScript/order';
import OrderSummary from '../components/OrderSummary';
import PaymentMethodComponent from '../components/PaymentMethod';
import ConfirmOrder from '../components/ConfirmOrder';
import { toast } from 'react-toastify';

export const Checkout: React.FC = () => {
   const navigate = useNavigate();
   const { state: cartState, clearCart } = useCart();
   const [step, setStep] = useState(1);
   const [address, setAddress] = useState<DeliveryAddress>({
       fullName: '',
       phoneNumber: '',
       city: '',
       street: '',
       buildingNumber: '',
       additionalDetails: ''
   });
   const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
   const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
   const [termsAccepted, setTermsAccepted] = useState(false);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
       if (!cartState.items.length) {
           toast.error('السلة فارغة');
           navigate('/cart');
       }
   }, [cartState.items.length, navigate]);

   const handleSubmit = async () => {
       if (!address || !paymentMethod) {
           toast.error('يرجى إكمال جميع البيانات المطلوبة');
           return;
       }
       
       setLoading(true);
       
       try {
           const orderData: CreateOrderDto = {
               address,
               paymentMethod,
               paymentDetails
           };
           
           const order = await orderService.createOrder(orderData);
           await clearCart();
           toast.success('تم إنشاء الطلب بنجاح');
           navigate(`/orders/${order.id}`);
       } catch (error: any) {
           toast.error(error.response?.data?.message || 'حدث خطأ في إنشاء الطلب');
       } finally {
           setLoading(false);
       }
   };

   const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
       setAddress(prev => ({
           ...prev,
           [field]: value
       }));
   };

   const isAddressComplete = () => {
       return !!(
           address.fullName &&
           address.phoneNumber &&
           address.city &&
           address.street &&
           address.buildingNumber
       );
   };

   const renderStep = () => {
       switch (step) {
           case 1:
               return (
                   <OrderSummary
                       cartItems={cartState.items}
                       subTotal={cartState.total}
                       vatAmount={cartState.total * 0.15}
                       deliveryFee={25}
                       total={cartState.total * 1.15 + 25}
                       onNext={() => setStep(2)}
                   />
               );
           case 2:
               return (
                   <PaymentMethodComponent
                       selectedMethod={paymentMethod}
                       paymentDetails={paymentDetails}
                       onMethodSelect={setPaymentMethod}
                       onFieldChange={(field, value) => 
                           setPaymentDetails(prev => ({ ...prev, [field]: value }))}
                       onBack={() => setStep(1)}
                       onNext={() => setStep(3)}
                       isComplete={!!paymentMethod && Object.keys(paymentDetails).length > 0}
                   />
               );
           case 3:
               return (
                <ConfirmOrder
                cartItems={cartState.items}
                address={address}
                onAddressChange={handleAddressChange}
                subTotal={cartState.total}
                vatAmount={cartState.total * 0.15}
                deliveryFee={25}
                total={cartState.total * 1.15 + 25}
                totalAmount={cartState.total * 1.15}
                finalAmount={cartState.total * 1.15 + 25}
                paymentMethod={paymentMethod}
                paymentDetails={paymentDetails}
                loading={loading}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                termsAccepted={termsAccepted}
                onTermsAcceptedChange={setTermsAccepted}
              />
               );
       }
   };

   return (
       <div className="container mx-auto px-4 py-8">
           {renderStep()}
       </div>
   );
};

export default Checkout;