import React from 'react';
import { PaymentMethodType, PAYMENT_METHODS } from '../typerScript/order';

interface PaymentMethodProps {
    selectedMethod: PaymentMethodType | null;
    onMethodSelect: (method: PaymentMethodType) => void;
    paymentDetails: Record<string, string>;
    onFieldChange: (field: string, value: string) => void;
    onBack: () => void;
    onNext: () => void;
    isComplete: boolean;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
    selectedMethod,
    paymentDetails,
    onMethodSelect,
    onFieldChange,
    onBack,
    onNext,
    isComplete
}) => {
    const renderPaymentFields = () => {
        if (!selectedMethod) return null;
        const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
        if (!method) return null;
        return (
            <div className="mt-6 space-y-4">
                {method.fields.map(field => (
                    <div key={field.name}>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={paymentDetails[field.name] || ''}
                            onChange={(e) => onFieldChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">اختر طريقة الدفع</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map(method => (
                    <label
                        key={method.id}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedMethod === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            checked={selectedMethod === method.id}
                            onChange={() => onMethodSelect(method.id)}
                            className="sr-only"
                        />
                        <span className="text-2xl ml-4">{method.icon}</span>
                        <span className="font-medium">{method.label}</span>
                    </label>
                ))}
            </div>
            {renderPaymentFields()}
            <div className="mt-8 flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    رجوع
                </button>
                <button
                    onClick={onNext}
                    disabled={!isComplete}
                    className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                        isComplete
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    متابعة
                </button>
            </div>
        </div>
    );
};

export default PaymentMethod;