import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import { Review, ReviewSummary } from '../types/comment-review';
import { 
  Loader, 
  Star, 
  Filter, 
  Check, 
  AlertTriangle, 
  X, 
  FileText,
  Search,
  Download
} from 'lucide-react';
import RatingStars from '../components/reviews/RatingStars';
import { toast } from 'react-toastify';

const AdminReviewsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<boolean | null>(null);
  
  // جلب تقييمات المنتجات
  useEffect(() => {
    const fetchReviews = async () => {
        try {
          setLoading(true);
          // استخدام خدمة جلب جميع التقييمات للمسؤول
          const response = await reviewService.getAllReviews(1, 100);
          setReviews(response.reviews);
          setFilteredReviews(response.reviews);
        } catch (err) {
          console.error('Error fetching reviews:', err);
          setError('فشل في تحميل التقييمات');
        } finally {
          setLoading(false);
        }
      };

    fetchReviews();
  }, []);

  // تطبيق الفلترة على التقييمات
  useEffect(() => {
    let result = [...reviews];
    
    // فلترة حسب النص
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        review => 
          review.userName.toLowerCase().includes(query) ||
          (review.comment && review.comment.toLowerCase().includes(query)) ||
          (review.productName && review.productName.toLowerCase().includes(query))
      );
    }
    
    // فلترة حسب التقييم
    if (selectedRating !== null) {
      result = result.filter(review => review.rating === selectedRating);
    }
    
    // فلترة حسب التحقق من الشراء
    if (selectedVerification !== null) {
      result = result.filter(review => review.isVerifiedPurchase === selectedVerification);
    }
    
    setFilteredReviews(result);
  }, [reviews, searchQuery, selectedRating, selectedVerification]);

  // دالة حذف تقييم
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      return;
    }

    try {
      setLoading(true);
      await reviewService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      toast.success('تم حذف التقييم بنجاح');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('فشل في حذف التقييم');
    } finally {
      setLoading(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // تصدير البيانات
  const exportReviews = () => {
    const headers = [
      'معرف التقييم',
      'المستخدم',
      'المنتج',
      'التقييم',
      'التعليق',
      'مشتري مؤكد',
      'تاريخ الإنشاء'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredReviews.map(review => [
        review.id,
        review.userName,
        review.productName || `منتج #${review.productId}`,
        review.rating,
        review.comment ? `"${review.comment.replace(/"/g, '""')}"` : '',
        review.isVerifiedPurchase ? 'نعم' : 'لا',
        formatDate(review.createdAt)
      ].join(','))
    ].join('\n');
    
    // إنشاء رابط للتنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reviews-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 rtl" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة تقييمات المنتجات</h1>
        <button
          onClick={exportReviews}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          تصدير البيانات
        </button>
      </div>

      {/* أدوات الفلترة */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* البحث */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">بحث</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث عن مستخدم أو محتوى..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* فلتر التقييم */}
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">التقييم</label>
            <select
              value={selectedRating !== null ? selectedRating : ''}
              onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : null)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">الكل</option>
              <option value="5">5 نجوم</option>
              <option value="4">4 نجوم</option>
              <option value="3">3 نجوم</option>
              <option value="2">2 نجوم</option>
              <option value="1">1 نجمة</option>
            </select>
          </div>

          {/* فلتر المشتريات المؤكدة */}
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع التقييم</label>
            <select
              value={selectedVerification !== null ? String(selectedVerification) : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setSelectedVerification(null);
                } else {
                  setSelectedVerification(value === 'true');
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">الكل</option>
              <option value="true">مشتريات مؤكدة</option>
              <option value="false">غير مؤكدة</option>
            </select>
          </div>

          {/* زر إعادة ضبط الفلاتر */}
          <div className="w-full sm:w-auto flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRating(null);
                setSelectedVerification(null);
              }}
              className="w-full sm:w-auto p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        </div>
      </div>

    {/* جدول التقييمات */}
<div className="bg-white rounded-lg shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المستخدم</th>
          <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المنتج</th>
          <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">التقييم</th>
          <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">نوع التقييم</th>
          <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ الإنشاء</th>
          <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {filteredReviews.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
              لا توجد تقييمات متطابقة مع الفلاتر المحددة
            </td>
          </tr>
        ) : (
          filteredReviews.map((review) => (
            <tr key={review.id} className="hover:bg-gray-50">
<td className="px-6 py-4 text-sm text-gray-900">
  <div className="font-medium">  {review.userName || 'مستخدم غير معروف'}</div>
  <div className="text-gray-500 text-xs">{review.userId || 'بدون معرف'}</div>
</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{review.productName || `منتج #${review.productId}`}</div>
                <div className="text-gray-500 text-xs">معرف: {review.productId}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex flex-col">
                  <RatingStars rating={review.rating} size="sm" />
                  <div className="mt-1 text-xs text-gray-600">
                    {review.comment && (
                      <details>
                        <summary className="cursor-pointer">عرض التعليق</summary>
                        <p className="mt-1 p-2 bg-gray-50 rounded-md">{review.comment}</p>
                      </details>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                {review.isVerifiedPurchase ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center w-fit">
                    <Check className="w-3 h-3 mr-1" /> مشتري مؤكد
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center w-fit">
                    غير مؤكد
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-800"
                    title="حذف التقييم"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* إحصائيات التقييمات */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">إحصائيات التقييمات</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">إجمالي التقييمات:</span>
              <span className="font-medium">{reviews.length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">متوسط التقييمات:</span>
              <span className="font-medium">
                {reviews.length > 0 
                  ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">مشتريات مؤكدة:</span>
              <span className="font-medium">
                {reviews.filter(review => review.isVerifiedPurchase).length} 
                ({reviews.length > 0 
                  ? Math.round(reviews.filter(review => review.isVerifiedPurchase).length / reviews.length * 100)
                  : 0}%)
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">تقييمات بتعليقات:</span>
              <span className="font-medium">
                {reviews.filter(review => review.comment && review.comment.trim() !== '').length}
                ({reviews.length > 0 
                  ? Math.round(reviews.filter(review => review.comment && review.comment.trim() !== '').length / reviews.length * 100)
                  : 0}%)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">توزيع التقييمات</h3>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(review => review.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center ml-2 w-16">
                    <span className="text-sm text-gray-600 ml-1">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 mr-2 w-16">
                    {Math.round(percentage)}% ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">الإجراءات السريعة</h3>
          
          <div className="space-y-3">
            <button
              onClick={exportReviews}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير جميع التقييمات
            </button>
            
            <button
              onClick={() => {
                /* تنفيذ عرض التقارير */
                toast.info('ميزة التقارير قيد التطوير');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              تقرير التقييمات الشهري
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;