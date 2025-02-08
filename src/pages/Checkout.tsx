import React, { useState, useEffect } from 'react';
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

    const handleSubmit = async () => {
        if (!address || !paymentMethod) {
            toast.error('يرجى إكمال جميع البيانات المطلوبة');
            return;
        }
        
        setLoading(true);
        
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
            })),
            paymentMethod: 6 as unknown as PaymentMethodType, // تعديل هنا
            paymentDetails: {
                phone: address.phoneNumber
            }
        };
        
        try {
            console.log('Sending order data:', orderData);
            const order = await orderService.createOrder(orderData);
            await clearCart();
            toast.success('تم إنشاء الطلب بنجاح');
            navigate(`/orders/${order.id}`);
        } catch (error: any) {
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
                        subTotal={cartState.total}
                        vatAmount={cartState.total * 0.15}
                        deliveryFee={25}
                        total={cartState.total * 1.15 + 25}
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
                        subTotal={cartState.total}
                        vatAmount={cartState.total * 0.15}
                        deliveryFee={25}
                        total={cartState.total * 1.15 + 25}
                        totalAmount={cartState.total * 1.15}
                        finalAmount={cartState.total * 1.15 + 25}
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