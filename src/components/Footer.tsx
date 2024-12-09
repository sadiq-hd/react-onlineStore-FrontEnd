import React from 'react';
import.meta.glob('/src/assets/*')
import madaSvg from '/src/assets/mada.svg'
import applepaypng from '/src/assets/applepay.png'
import googleplaySvg from '/src/assets/google-play.svg'
import stcpaySvg from '/src/assets/stcpay.svg'
import payWebp from '/src/assets/pay.webp'
import samsungPaySvg from '/src/assets/SamsungPay.svg'
const SocialIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d={d} />
  </svg>
);

const Footer: React.FC = () => {
  const socialIcons = [
    { name: 'Twitter', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
    { name: 'Instagram', path: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z' },
    { name: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' }
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <div className='mt-[12px] border-t-[0.2px] border-slate-50'></div>

            <ul className="space-y-2">
              {['سياسة الخصوصية', 'شروط الخدمة', 'سياسة الاسترداد', 'سياسة الشحن'].map((item) => (
                <li key={item}><a href="https://www.linkedin.com/in/sadiq-aldubaisi-69721b222/" className="hover:text-gray-400 transition-colors duration-300">{item}</a></li>
              ))}
            </ul>

          </div>


        
         
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <div className='mt-[12px] border-t-[0.2px] border-slate-50'></div>
            <div className="flex space-x-2">
              {socialIcons.map((icon) => (
                <a key={icon.name} href="https://www.linkedin.com/in/sadiq-aldubaisi-69721b222/" className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors duration-300">
                  <SocialIcon d={icon.path} />
                </a>
              ))}
            </div>
          </div>
          

          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">وسائل الدفع</h3>
            <div className='mt-[12px] border-t-[0.2px] border-slate-50'></div>

            <div className="flex flex-wrap gap-4">
            <img src={madaSvg} alt="mada" className="w-16 h-16 object-contain bg-white p-2 rounded-lg transition-transform hover:scale-110" />
  <img src={applepaypng} alt="apple pay" className="w-16 h-16 object-contain bg-white p-2 rounded-lg transition-transform hover:scale-110" />
  <img src={googleplaySvg} alt="Google Pay" className="w-16 h-16 object-contain bg-white p-2 rounded-lg transition-transform hover:scale-110" />
  <img src={stcpaySvg} alt="STC Pay" className="w-16 h-16 object-contain bg-white p-2 rounded-lg transition-transform hover:scale-110" />
  <img src={payWebp} alt="Pay" className="w-16 h-16 object-contain bg-white p-2 rounded-lg transition-transform hover:scale-110" />
  <img src={samsungPaySvg} alt="Samsung Pay" className="w-16 h-16 object-contain bg-white p-2 rounded-lg transition-transform hover:scale-110" />
</div>
          </div>
          

          
      
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">&copy; 2025 متجر إلكتروني. جميع الحقوق محفوظة.</p>
          <p className="text-sm mt-2">Develov with love by Sadiq Aldubaisi</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;