import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { CreateOrderDto, PaymentMethodType, DeliveryAddress } from '../typerScript/order';
import OrderSummary from '../components/OrderSummary';
import PaymentMethodComponent from '../components/PaymentMethod';
import ConfirmOrder from '../components/ConfirmOrder';
import DeliveryAddressForm from '../components/DeliveryAddressForm';
import { toast } from 'react-toastify';

const Checkout: React.FC = () => {
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

    // حساب المبالغ باستخدام useMemo لتحسين الأداء
    const { 
        originalSubTotal, 
        discountAmount, 
        subTotalAfterDiscount, 
        vatAmount, 
        deliveryFee, 
        finalAmount 
    } = useMemo(() => {
        // المجموع الأصلي قبل الخصم
        const originalSubTotal = cartState.items.reduce(
            (total, item) => total + (item.price * item.quantity), 0
        );
        
        // حساب إجمالي الخصم
        const discountAmount = cartState.items.reduce((total, item) => {
            if (item.hasDiscount && item.discountedPrice !== undefined) {
                return total + ((item.price - item.discountedPrice) * item.quantity);
            }
            return total;
        }, 0);
        
        // المجموع بعد الخصم (هذا المبلغ يشمل الضريبة)
        const subTotalAfterDiscount = cartState.items.reduce((total, item) => {
            const priceToUse = item.hasDiscount && item.discountedPrice !== undefined
                ? item.discountedPrice
                : item.price;
            return total + (priceToUse * item.quantity);
        }, 0);
        
        // استخراج قيمة الضريبة (15%) من السعر بعد الخصم (ضريبة متضمنة في السعر)
        const vatAmount = Number(((subTotalAfterDiscount * 0.15) / 1.15).toFixed(2));
        
        // رسوم الشحن الثابتة
        const deliveryFee = 25;
        
        // السعر النهائي = المجموع بعد الخصم (بما في ذلك الضريبة) + رسوم الشحن
        const finalAmount = Number((subTotalAfterDiscount + deliveryFee).toFixed(2));
        
        return { 
            originalSubTotal: Number(originalSubTotal.toFixed(2)), 
            discountAmount: Number(discountAmount.toFixed(2)), 
            subTotalAfterDiscount: Number(subTotalAfterDiscount.toFixed(2)), 
            vatAmount, 
            deliveryFee, 
            finalAmount 
        };
    }, [cartState.items]);

    const handleSubmit = async () => {
        if (!address || !paymentMethod) {
            toast.error('يرجى إكمال جميع البيانات المطلوبة');
            return;
        }
        
        setLoading(true);
        
        // التحقق من صحة بيانات الدفع
        if (paymentMethod === PaymentMethodType.CREDIT_CARD || paymentMethod === PaymentMethodType.MADA) {
            if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
                toast.error('يرجى إكمال جميع بيانات البطاقة');
                setLoading(false);
                return;
            }
        }
        
        const orderData: CreateOrderDto = {
            address: {
                fullName: address.fullName,
                phoneNumber: address.phoneNumber,
                city: address.city,
                street: address.street,
                buildingNumber: address.buildingNumber || '',
                additionalDetails: address.additionalDetails || ''
            },
            items: cartState.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
                // لا ترسل معلومات الخصم هنا - الخادم سيتعامل معها
            })),
            paymentMethod: paymentMethod,
            paymentDetails: paymentMethod === PaymentMethodType.CASH_ON_DELIVERY 
                ? { phone: address.phoneNumber } 
                : paymentDetails
        };
        
        try {
            console.log('Sending order data:', JSON.stringify(orderData, null, 2));
            const order = await orderService.createOrder(orderData);
            await clearCart();
            toast.success('تم إنشاء الطلب بنجاح');
            navigate(`/orders/${order.id}`);
        } catch (error: any) {
            console.error('Order creation error details:', error.response?.data);
            toast.error(error.message || 'حدث خطأ في إنشاء الطلب');
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

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <OrderSummary
                        cartItems={cartState.items}
                        subTotal={subTotalAfterDiscount}
                        discountAmount={discountAmount}
                        vatAmount={vatAmount}
                        deliveryFee={deliveryFee}
                        total={finalAmount}
                        onNext={() => setStep(2)}
                    />
                );
            case 2:
                return (
                    <DeliveryAddressForm
                        orderId={0}
                        onSubmit={(newAddress: DeliveryAddress) => {
                            setAddress(newAddress);
                            setStep(3);
                        }}
                        onBack={() => setStep(1)}
                    />
                );
            case 3:
                return (
                    <PaymentMethodComponent
                        selectedMethod={paymentMethod}
                        paymentDetails={paymentDetails}
                        onMethodSelect={(method: PaymentMethodType) => setPaymentMethod(method)}
                        onFieldChange={(field, value) => 
                            setPaymentDetails(prev => ({ ...prev, [field]: value }))}
                        onBack={() => setStep(2)}
                        onNext={() => setStep(4)}
                        isComplete={!!paymentMethod && Object.keys(paymentDetails).length > 0}
                    />
                );
            case 4:
                return (
                    <ConfirmOrder
                        cartItems={cartState.items}
                        address={address}
                        onAddressChange={handleAddressChange}
                        subTotal={subTotalAfterDiscount}
                        discountAmount={discountAmount}
                        vatAmount={vatAmount}
                        deliveryFee={deliveryFee}
                        totalAmount={subTotalAfterDiscount}
                        finalAmount={finalAmount}
                        paymentMethod={paymentMethod}
                        paymentDetails={paymentDetails}
                        loading={loading}
                        onBack={() => setStep(3)}
                        onSubmit={handleSubmit}
                        termsAccepted={termsAccepted}
                        onTermsAcceptedChange={setTermsAccepted}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {renderStepContent()}
        </div>
    );
};

export default Checkout;