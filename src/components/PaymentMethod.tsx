import React, { useState } from 'react';
import { 
    PaymentMethodType, 
    PAYMENT_METHODS, 
    formatCardNumber, 
    formatExpiryDate 
} from '../typerScript/order';

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
    // إضافة حالة للأخطاء
    const [errors, setErrors] = useState<Record<string, string>>({});

    // التحقق من صحة الحقل وتحديث الأخطاء
    const validateField = (field: string, value: string) => {
        if (!selectedMethod) return true;
        
        const methodConfig = PAYMENT_METHODS.find(m => m.id === selectedMethod);
        if (!methodConfig) return true;
        
        const fieldConfig = methodConfig.fields.find(f => f.name === field);
        if (!fieldConfig) return true;
        
        const isValid = fieldConfig.validation(value);
        
        setErrors(prev => ({
            ...prev,
            [field]: isValid ? '' : `${fieldConfig.label} غير صالح`
        }));
        
        return isValid;
    };

    // معالجة تغيير الحقول مع تنسيق القيم وتحقق
    const handleFieldChange = (field: string, value: string) => {
        let formattedValue = value;
        
        // تطبيق التنسيق المناسب حسب نوع الحقل
        if (field === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (field === 'expiryDate') {
            formattedValue = formatExpiryDate(value);
        }
        
        onFieldChange(field, formattedValue);
        
        // تحقق مباشر لبعض أنواع الحقول
        if (['cardNumber', 'expiryDate', 'cvv', 'phone'].includes(field)) {
            validateField(field, formattedValue);
        }
    };

    // التحقق من اكتمال جميع الحقول المطلوبة
    const checkFormCompletion = () => {
        if (!selectedMethod) return false;
        
        const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
        if (!method) return false;
        
        // تحقق من جميع الحقول
        let allValid = true;
        const newErrors: Record<string, string> = {};
        
        method.fields.forEach(field => {
            const value = paymentDetails[field.name] || '';
            const isValid = field.validation(value);
            
            if (!isValid) {
                newErrors[field.name] = `${field.label} غير صالح`;
                allValid = false;
            }
        });
        
        setErrors(newErrors);
        return allValid;
    };

    // معالجة النقر على زر المتابعة
    const handleNext = () => {
        const isValid = checkFormCompletion();
        if (isValid) {
            onNext();
        }
    };

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
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            onBlur={(e) => validateField(field.name, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[field.name] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            // إضافة سمات HTML حسب نوع الحقل
                            {...(field.name === 'cardNumber' && { 
                                inputMode: "numeric",
                                maxLength: 19,
                                autoComplete: "cc-number"
                            })}
                            {...(field.name === 'expiryDate' && { 
                                inputMode: "numeric",
                                maxLength: 5,
                                autoComplete: "cc-exp"
                            })}
                            {...(field.name === 'cvv' && { 
                                inputMode: "numeric",
                                maxLength: 4,
                                autoComplete: "cc-csc"
                            })}
                            {...(field.name === 'phone' && { 
                                inputMode: "tel",
                                maxLength: 10,
                                autoComplete: "tel"
                            })}
                            required
                        />
                        {errors[field.name] && (
                            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">اختر طريقة الدفع</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map(method => {
                    // السماح فقط بخياري البطاقة الائتمانية والدفع عند الاستلام
                    const isEnabled = method.id === PaymentMethodType.CREDIT_CARD || 
                                     method.id === PaymentMethodType.CASH_ON_DELIVERY;
                    
                    return (
                        <label
                            key={method.id}
                            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                selectedMethod === method.id
                                ? 'border-blue-600 bg-blue-50'
                                : isEnabled 
                                  ? 'border-gray-200 hover:border-blue-200'
                                  : 'border-gray-200 opacity-50 cursor-not-allowed'
                            }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedMethod === method.id}
                                onChange={() => {
                                    if (isEnabled) {
                                        onMethodSelect(method.id);
                                        setErrors({});
                                    }
                                }}
                                disabled={!isEnabled}
                                className="sr-only"
                            />
                            <span className="text-2xl ml-4">{method.icon}</span>
                            <span className="font-medium">{method.label}</span>
                            {!isEnabled && (
                                <span className="ml-2 text-xs text-gray-500">(قريبًا)</span>
                            )}
                        </label>
                    );
                })}
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
                    onClick={handleNext}
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