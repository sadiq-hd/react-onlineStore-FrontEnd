// src/components/home/StoreFeatures.tsx
import React from 'react';

interface FeatureItem {
  icon: JSX.Element;
  title: string;
  description: string;
}

const StoreFeatures: React.FC = () => {
  const features: FeatureItem[] = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
        </svg>
      ),
      title: "شحن سريع",
      description: "توصيل بين يوم إلى 3 أيام عمل في جميع أنحاء المملكة"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "الدفع الآمن",
      description: "طرق دفع متعددة ومؤمنة بالكامل لراحتك"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "ضمان الجودة",
      description: "منتجات أصلية 100% مع ضمان استرجاع خلال 14 يوم"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "دعم فني",
      description: "متاح على مدار الساعة لمساعدتك في جميع استفساراتك"
    }
  ];

  return (
    <div className="mb-8 bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        لماذا تختارنا؟
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="bg-purple-50 rounded-lg p-4 flex flex-col items-center text-center hover:bg-purple-100 transition-colors">
            <div className="bg-purple-100 p-3 rounded-full mb-3">
              {feature.icon}
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
            <p className="text-xs text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreFeatures;