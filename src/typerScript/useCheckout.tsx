import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { PaymentMethodType, PAYMENT_METHODS, CreateOrderDto, DeliveryAddress } from './order';
import { toast } from 'react-toastify';

export const useCheckout = () => {
   const navigate = useNavigate();
   const { state: cartState, fetchCart } = useCart();
   const [loading, setLoading] = useState(false);
   const [currentStep, setCurrentStep] = useState(1);
   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
   const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
   const [termsAccepted, setTermsAccepted] = useState(false);
   const [address, setAddress] = useState<DeliveryAddress>({
       fullName: '',
       phoneNumber: '',
       city: '',
       street: '',
       buildingNumber: '',
       additionalDetails: ''
   });

   const validateForm = () => {
       if (currentStep === 2) {
           if (!address.fullName || !address.phoneNumber || !address.city || !address.street || !address.buildingNumber) {
               toast.error('الرجاء إكمال بيانات التوصيل');
               return false;
           }
       }

       if (currentStep === 3) {
           if (!selectedPaymentMethod) {
               toast.error('الرجاء اختيار طريقة دفع');
               return false;
           }

           const selectedMethodConfig = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);
           if (selectedMethodConfig) {
               const missingFields = selectedMethodConfig.fields.filter(
                   field => !paymentDetails[field.name]?.trim()
               );

               if (missingFields.length > 0) {
                   toast.error(`الرجاء تعبئة: ${missingFields.map(f => f.label).join(', ')}`);
                   return false;
               }
           }
       }

       if (currentStep === 4) {
           if (!termsAccepted) {
               toast.error('يجب الموافقة على الشروط والأحكام');
               return false;
           }
       }

       return true;
   };

   const handleSubmit = async () => {
       if (!validateForm()) return;

       try {
           setLoading(true);

           const orderData: CreateOrderDto = {
               address,
               paymentMethod: selectedPaymentMethod!,
               paymentDetails
           };

           const response = await orderService.createOrder(orderData);
           await fetchCart();

           toast.success('تم إنشاء الطلب بنجاح');
           navigate(`/orders/${response.id}`);
       } catch (error: any) {
           console.error('Error creating order:', error);
           if (error.response?.status === 401) {
               toast.error('يرجى تسجيل الدخول أولاً');
               navigate('/signin');
           } else {
               toast.error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الطلب');
           }
       } finally {
           setLoading(false);
       }
   };

   const goToNextStep = () => {
    if (currentStep < 4 && isStepComplete()) {
        setCurrentStep(step => step + 1);
    }
   };

   const goToPreviousStep = () => {
       if (currentStep > 1) {
           setCurrentStep(step => step - 1);
       }
   };

   const isStepComplete = () => {
    switch (currentStep) {
        case 1:
            return true; // ملخص الطلب
        case 2:
            return !!address.fullName && !!address.phoneNumber && !!address.city && !!address.street && !!address.buildingNumber;
        case 3:
            return !!selectedPaymentMethod && PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.fields.every(field => paymentDetails[field.name]?.trim());
        case 4:
            return termsAccepted;
        default:
            return false;
    }
};
   const handlePaymentMethodSelect = (method: PaymentMethodType) => {
       setSelectedPaymentMethod(method);
       setPaymentDetails({});
   };

   const handleFieldChange = (fieldName: string, value: string) => {
       setPaymentDetails(prev => ({
           ...prev,
           [fieldName]: value
       }));
   };

   const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
       setAddress(prev => ({
           ...prev,
           [field]: value
       }));
   };

   return {
       cartState,
       loading,
       currentStep,
       selectedPaymentMethod,
       paymentDetails,
       address,
       termsAccepted,
       setTermsAccepted,
       handlePaymentMethodSelect,
       handleFieldChange,
       handleAddressChange,
       isStepComplete,
       handleSubmit,
       goToNextStep,
       goToPreviousStep
   };
};
