import React from 'react';

export const CHECKOUT_STEPS = [
    { id: 1, title: 'مراجعة الطلب' },
    { id: 2, title: 'إدخال العنوان' },  
    { id: 3, title: 'طريقة الدفع' },
    { id: 4, title: 'تأكيد الطلب' }
] as const;

interface CheckoutStepsProps {
    currentStep: number;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
    return (
        <div className="flex justify-between mb-8">
            {CHECKOUT_STEPS.map((step) => (
                <div 
                    key={step.id}
                    className={`flex-1 text-center ${
                        step.id < currentStep ? 'text-green-600' :
                        step.id === currentStep ? 'text-blue-600' :
                        'text-gray-400'
                    }`}
                >
                    <div className="relative">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${
                            step.id < currentStep ? 'border-green-600 bg-green-100' :
                            step.id === currentStep ? 'border-blue-600 bg-blue-100' :
                            'border-gray-300 bg-gray-50'
                        }`}>
                            {step.id < currentStep ? '✓' : step.id}
                        </div>
                        <div className="mt-2">{step.title}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CheckoutSteps;