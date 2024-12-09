import React from 'react';
import { Link } from 'react-router-dom';

const FAQ: React.FC = () => {
  return (
    <div className="min-h-screen rtl bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-purple-600 text-white">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in-down">
              الأسئلة الشائعة
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed animate-fade-in-up">
              كل ما تحتاج معرفته عن خدماتنا ومنتجاتنا في مكان واحد
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">الأسئلة المتكررة</h2>
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2 text-purple-500">❓</span>
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-purple-800 mb-6">هل لديك أسئلة أخرى؟</h2>
          <p className="text-lg text-gray-700 mb-8">
            فريق الدعم الخاص بنا متاح دائمًا للإجابة على جميع استفساراتك.
          </p>
          <button onClick={() => window.location.href = '/contact-me'} className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow-md hover:bg-purple-700 transition">
            تواصل معنا
          </button>
        </div>
      </div>
    </div>
  );
};

const faqs = [
  {
    question: "كيف يمكنني إنشاء حساب جديد؟",
    answer:
      "يمكنك إنشاء حساب جديد بسهولة عن طريق النقر على زر التسجيل في أعلى الصفحة وملء البيانات المطلوبة."
  },
  {
    question: "ما هي طرق الدفع المتوفرة؟",
    answer:
      "نوفر طرق دفع متعددة تشمل البطاقات البنكية، التحويل البنكي، والدفع عند الاستلام."
  },
  {
    question: "هل يمكنني استرجاع المنتجات؟",
    answer:
      "نعم، يمكنك استرجاع المنتجات خلال 14 يومًا من تاريخ الشراء بشرط أن تكون في حالتها الأصلية."
  },
  {
    question: "كيف يمكنني تتبع طلبي؟",
    answer:
      "يمكنك تتبع طلبك من خلال صفحة الطلبات في حسابك الشخصي حيث ستجد جميع التفاصيل."
  }
];

export default FAQ;
