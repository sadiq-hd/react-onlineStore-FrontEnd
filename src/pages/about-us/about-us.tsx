import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen rtl bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-blue-600 text-white">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in-down">
              تسوق بثقة معنا
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed animate-fade-in-up">
              نقدم لكم تجربة تسوق فريدة مع تشكيلة واسعة من المنتجات عالية الجودة وبأسعار منافسة
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">🚚</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">توصيل سريع</h3>
            <p className="text-gray-600 leading-relaxed">
              نضمن وصول منتجاتك في أسرع وقت ممكن مع خدمة التتبع المباشر للشحنات
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">💯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">ضمان الجودة</h3>
            <p className="text-gray-600 leading-relaxed">
              نوفر منتجات أصلية 100% مع ضمان استرجاع خلال 14 يوم
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">💳</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">دفع آمن</h3>
            <p className="text-gray-600 leading-relaxed">
              طرق دفع متعددة وآمنة مع حماية كاملة لبياناتك المالية
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">مميزات متجرنا</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-blue-600">+10K</div>
            <div className="text-gray-600">عميل سعيد</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-blue-600">+5K</div>
            <div className="text-gray-600">منتج متنوع</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-blue-600">%99</div>
            <div className="text-gray-600">رضا العملاء</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-blue-600">24/7</div>
            <div className="text-gray-600">دعم العملاء</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: "🔍",
    title: "تصفح سهل",
    description: "واجهة سهلة الاستخدام مع خيارات بحث متقدمة"
  },
  {
    icon: "🏷️",
    title: "أسعار تنافسية",
    description: "أفضل الأسعار مع عروض وخصومات مستمرة"
  },
  {
    icon: "⭐",
    title: "منتجات مميزة",
    description: "تشكيلة واسعة من أفضل العلامات التجارية"
  },
  {
    icon: "📱",
    title: "تطبيق ذكي",
    description: "تسوق بسهولة من خلال تطبيقنا للجوال"
  }
];

export default AboutUs;