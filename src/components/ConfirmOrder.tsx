import React from 'react';
import { CartItem } from '../typerScript/cart';
import { PaymentMethodType, PAYMENT_METHODS, DeliveryAddress } from '../typerScript/order';
import { orderService } from '../services/orderService';

interface ConfirmOrderProps {
    cartItems: CartItem[];
    total: number;
    subTotal: number;
    vatAmount: number;
    totalAmount: number;
    deliveryFee: number;
    finalAmount: number;
    paymentMethod: PaymentMethodType | null;
    paymentDetails: Record<string, string>;
    loading: boolean;
    onBack: () => void;
    onSubmit: () => void;
    termsAccepted: boolean;
    address: DeliveryAddress;
    onAddressChange: (field: keyof DeliveryAddress, value: string) => void;
    onTermsAcceptedChange: (accepted: boolean) => void;
}

const ConfirmOrder: React.FC<ConfirmOrderProps> = ({
    cartItems,
    subTotal,
    vatAmount,
    totalAmount,
    deliveryFee,
    finalAmount,
    paymentMethod,
    paymentDetails,
    loading,
    onBack,
    onSubmit,
    termsAccepted,
    address,
    onTermsAcceptedChange
}) => {
    const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

    const renderCartItems = () => (
        <div>
            <h3 className="font-medium text-gray-700 mb-2">ملخص المنتجات</h3>
            <div className="space-y-2">
                {cartItems.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                        <div>
                            <span>{item.name}</span>
                            <span className="text-gray-400 mx-1">×</span>
                            <span>{item.quantity}</span>
                        </div>
                        <span>{orderService.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderOrderSummary = () => (
        <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{orderService.formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span>{orderService.formatCurrency(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
                <span>رسوم التوصيل</span>
                <span>{orderService.formatCurrency(deliveryFee)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center font-bold text-lg">
                <span>المبلغ الإجمالي</span>
                <span className="text-green-600">{orderService.formatCurrency(finalAmount)}</span>
            </div>
        </div>
    );

    const renderPaymentDetails = () => (
        <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-2">تفاصيل الدفع</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                    طريقة الدفع: <span className="font-medium">{selectedMethod?.label}</span>
                </p>
                {selectedMethod?.fields.map(field => (
                    <p key={field.name} className="text-sm text-gray-600">
                        <span>{field.label}: </span>
                        <span className="font-medium">
                            {field.type === 'password' 
                                ? '••••' 
                                : field.type === 'tel'
                                    ? paymentDetails[field.name]
                                    : field.name === 'cardNumber'
                                        ? `•••• •••• •••• ${paymentDetails[field.name]?.slice(-4) || '****'}`
                                        : paymentDetails[field.name]
                            }
                        </span>
                    </p>
                ))}
            </div>
        </div>
    );

    const renderDeliveryAddress = () => (
        <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-2">عنوان التوصيل</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">
                    <span>الاسم: </span>
                    <span className="font-medium">{address.fullName}</span>
                </p>
                <p className="text-sm text-gray-600">
                    <span>الجوال: </span>
                    <span className="font-medium">{address.phoneNumber}</span>
                </p>
                <p className="text-sm text-gray-600">
                    <span>المدينة: </span>
                    <span className="font-medium">{address.city}</span>
                </p>
                <p className="text-sm text-gray-600">
                    <span>الشارع: </span>
                    <span className="font-medium">{address.street}</span>
                </p>
                {address.buildingNumber && (
                    <p className="text-sm text-gray-600">
                        <span>رقم المبنى: </span>
                        <span className="font-medium">{address.buildingNumber}</span>
                    </p>
                )}
                {address.additionalDetails && (
                    <p className="text-sm text-gray-600">
                        <span>تفاصيل إضافية: </span>
                        <span className="font-medium">{address.additionalDetails}</span>
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">تأكيد الطلب</h2>
            <div className="space-y-6">
                {renderCartItems()}
                {renderOrderSummary()}
                {renderPaymentDetails()}
                {renderDeliveryAddress()}

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => onTermsAcceptedChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                        أوافق على الشروط والأحكام
                    </label>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        disabled={loading}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        رجوع
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={loading || !termsAccepted}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                جارٍ تأكيد الطلب...
                            </span>
                        ) : 'تأكيد الطلب'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmOrder;