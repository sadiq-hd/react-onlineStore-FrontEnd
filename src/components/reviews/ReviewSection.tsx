// src/components/reviews/ReviewSection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Review, 
  CreateReviewDto, 
  ReviewSummary, 
  ReviewsResponse 
} from '../../types/comment-review';
import { reviewService } from '../../services/reviewService';
import RatingStars from './RatingStars';
import { 
  Star, 
  ThumbsUp, 
  Edit, 
  Trash,
  Send,
  X,
  Loader,
  User,
  AlertCircle
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'react-toastify';

interface ReviewSectionProps {
  productId: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const navigate = useNavigate();
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [userReviewed, setUserReviewed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // بيانات التقييم الجديد
  const [reviewData, setReviewData] = useState<{
    rating: number;
    comment: string;
  }>({
    rating: 5,
    comment: ''
  });

  // بيانات تعديل التقييم
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{
    rating: number;
    comment: string;
  }>({
    rating: 5,
    comment: ''
  });

  // جلب التقييمات والملخص
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // جلب بيانات التقييمات
        const data = await reviewService.getProductReviews(productId);
        setReviewsData(data);
        
        // التحقق إذا كان المستخدم قد قيم المنتج بالفعل
        try {
          const hasReviewed = await reviewService.hasUserReviewedProduct(productId);
          setUserReviewed(hasReviewed);
        } catch (err) {
          // إذا كان المستخدم غير مسجل، فلا يكون قد قيم المنتج
          setUserReviewed(false);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('فشل في تحميل التقييمات');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // دالة تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), {
        addSuffix: true,
        locale: ar
      });
    } catch (error) {
      return dateString;
    }
  };

  // التحقق إذا كان التقييم للمستخدم الحالي
  const isCurrentUserReview = (userId: string) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser && userId === currentUser.id;
  };

  // دالة إرسال تقييم جديد
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (reviewData.rating < 1) {
      toast.error('الرجاء اختيار تقييم من 1 إلى 5');
      return;
    }

    try {
      setSubmitting(true);
      const newReviewData: CreateReviewDto = {
        productId,
        rating: reviewData.rating,
        comment: reviewData.comment.trim() || undefined
      };

      const newReview = await reviewService.addReview(newReviewData);
      
      // تحديث البيانات بعد إضافة التقييم
      if (reviewsData) {
        // تحديث قائمة التقييمات
        const updatedReviews = [newReview, ...reviewsData.reviews];
        
        // تحديث ملخص التقييمات
        const totalReviews = reviewsData.summary.totalReviews + 1;
        const newAverage = (
          (reviewsData.summary.averageRating * reviewsData.summary.totalReviews) + 
          newReview.rating
        ) / totalReviews;
        
        // تحديث توزيع التقييمات
        const updatedDistribution = { ...reviewsData.summary.ratingDistribution };
        updatedDistribution[newReview.rating] = (updatedDistribution[newReview.rating] || 0) + 1;
        
        // تعيين البيانات المحدثة
        setReviewsData({
          ...reviewsData,
          reviews: updatedReviews,
          summary: {
            ...reviewsData.summary,
            totalReviews,
            averageRating: Math.round(newAverage * 10) / 10,
            ratingDistribution: updatedDistribution
          }
        });
      }
      
      setUserReviewed(true);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      toast.success('تم إضافة التقييم بنجاح');
    } catch (err: any) {
      console.error('Error adding review:', err);
      
      // إذا كان المستخدم قام بالتقييم بالفعل
      if (err.message?.includes('قمت بالفعل بتقييم هذا المنتج')) {
        setUserReviewed(true);
        setShowReviewForm(false);
        toast.info('لقد قمت بتقييم هذا المنتج مسبقًا. يمكنك تعديل تقييمك الحالي.');
      } else {
        toast.error('فشل في إضافة التقييم');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // دالة تحديث تقييم
  const handleUpdateReview = async (reviewId: number) => {
    if (editData.rating < 1) {
      toast.error('الرجاء اختيار تقييم من 1 إلى 5');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.updateReview(reviewId, {
        rating: editData.rating,
        comment: editData.comment.trim() || undefined
      });

      // تحديث التقييم في واجهة المستخدم
      if (reviewsData) {
        const updatedReviews = reviewsData.reviews.map(review => {
          if (review.id === reviewId) {
            return { ...review, rating: editData.rating, comment: editData.comment };
          }
          return review;
        });
        
        // إعادة حساب متوسط التقييم وتوزيع التقييمات
        const calculateSummary = () => {
          const totalReviews = updatedReviews.length;
          const sum = updatedReviews.reduce((acc, review) => acc + review.rating, 0);
          const averageRating = totalReviews > 0 ? sum / totalReviews : 0;
          
          // حساب توزيع التقييمات
          const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          updatedReviews.forEach(review => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
          });
          
          return {
            productId,
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution: distribution
          };
        };
        
        setReviewsData({
          ...reviewsData,
          reviews: updatedReviews,
          summary: calculateSummary()
        });
      }
      
      setEditingReviewId(null);
      setEditData({ rating: 5, comment: '' });
      toast.success('تم تحديث التقييم بنجاح');
    } catch (err) {
      console.error('Error updating review:', err);
      toast.error('فشل في تحديث التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  // دالة حذف تقييم
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.deleteReview(reviewId);

      // تحديث البيانات بعد الحذف
      if (reviewsData) {
        // إزالة التقييم من القائمة
        const updatedReviews = reviewsData.reviews.filter(review => review.id !== reviewId);
        
        // إعادة حساب ملخص التقييمات
        const calculateSummary = () => {
          const totalReviews = updatedReviews.length;
          if (totalReviews === 0) {
            return {
              productId,
              totalReviews: 0,
              averageRating: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
          }
          
          const sum = updatedReviews.reduce((acc, review) => acc + review.rating, 0);
          const averageRating = sum / totalReviews;
          
          // حساب توزيع التقييمات
          const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          updatedReviews.forEach(review => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
          });
          
          return {
            productId,
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution: distribution
          };
        };
        
        setReviewsData({
          ...reviewsData,
          reviews: updatedReviews,
          summary: calculateSummary()
        });
      }
      
      setUserReviewed(false);
      toast.success('تم حذف التقييم بنجاح');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('فشل في حذف التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  // مكون عرض توزيع التقييمات
  const ReviewDistribution = ({ summary }: { summary: ReviewSummary }) => {
    // حساب النسبة المئوية لكل تقييم
    const getPercentage = (count: number) => {
      if (summary.totalReviews === 0) return 0;
      return Math.round((count / summary.totalReviews) * 100);
    };

    return (
      <div className="mb-6">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = summary.ratingDistribution[rating] || 0;
          const percentage = getPercentage(count);
          
          return (
            <div key={rating} className="flex items-center mb-1">
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
              <span className="text-sm text-gray-600 mr-2 w-12">{percentage}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin w-8 h-8 text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (!reviewsData) {
    return null;
  }

  const { reviews, summary, pagination } = reviewsData;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Star className="inline-block ml-2 text-yellow-400 fill-yellow-400" />
        التقييمات والمراجعات
      </h2>

      {/* ملخص التقييمات */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          {/* متوسط التقييم */}
          <div className="flex flex-col items-center ml-6 mb-4 sm:mb-0">
            <div className="text-3xl font-bold text-gray-800 flex items-center">
              {summary.averageRating.toFixed(1)}
              <Star className="w-6 h-6 mr-1 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="mt-1">
              <RatingStars rating={summary.averageRating} />
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {summary.totalReviews} {summary.totalReviews === 1 ? 'تقييم' : 'تقييمات'}
            </p>
          </div>

          {/* توزيع التقييمات */}
          <div className="flex-1">
            <ReviewDistribution summary={summary} />
          </div>
        </div>
      </div>

      {/* زر إضافة تقييم */}
      {!userReviewed && !showReviewForm && (
        <div className="mb-6 text-center">
          <button
            onClick={() => {
              const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
              if (!currentUser) {
                navigate('/signin');
                return;
              }
              setShowReviewForm(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            إضافة تقييم
          </button>
        </div>
      )}

      {/* نموذج إضافة تقييم */}
      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="inline-block ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
            تقييم جديد
          </h3>
          
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">تقييمك:</label>
              <div className="flex items-center">
                <RatingStars
                  rating={reviewData.rating}
                  editable={true}
                  size="lg"
                  onChange={(rating) => setReviewData({ ...reviewData, rating })}
                />
                <span className="mr-2 text-gray-600">
                  {reviewData.rating} من 5
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">تعليقك (اختياري):</label>
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none"
                rows={4}
                placeholder="اكتب تعليقك وتجربتك مع المنتج..."
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                disabled={submitting}
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                disabled={submitting}
              >
                <X className="w-4 h-4" /> إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting || reviewData.rating < 1}
                className={`px-4 py-2 rounded-lg text-white flex items-center gap-1
                  ${submitting || reviewData.rating < 1
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                إرسال التقييم
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة التقييمات */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p>لا يوجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className={`bg-gray-50 rounded-lg p-4 
                ${review.isVerifiedPurchase ? 'border-l-4 border-green-500' : ''}`}
            >
              {/* رأس التقييم - اسم المستخدم والتقييم */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 ml-3 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{review.userName}</h3>
                    <div className="flex items-center">
                      <RatingStars rating={review.rating} size="sm" />
                      <span className="mr-2 text-gray-500 text-xs">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isCurrentUserReview(review.userId) && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingReviewId(review.id);
                        setEditData({
                          rating: review.rating,
                          comment: review.comment || ''
                        });
                      }}
                      className="text-blue-500 hover:text-blue-600"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-500 hover:text-red-600"
                      title="حذف"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* محتوى التقييم */}
              {editingReviewId === review.id ? (
                <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1 text-sm">تقييمك:</label>
                    <div className="flex items-center">
                      <RatingStars
                        rating={editData.rating}
                        editable={true}
                        onChange={(rating) => setEditData({ ...editData, rating })}
                      />
                      <span className="mr-2 text-gray-600 text-sm">
                        {editData.rating} من 5
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1 text-sm">تعليقك (اختياري):</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows={3}
                      value={editData.comment}
                      onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingReviewId(null);
                        setEditData({ rating: 5, comment: '' });
                      }}
                      className="px-3 py-1 bg-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-300"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => handleUpdateReview(review.id)}
                      disabled={submitting || editData.rating < 1}
                      className={`px-3 py-1 rounded-lg text-white text-sm
                        ${submitting || editData.rating < 1
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      {submitting ? <Loader className="w-3 h-3 animate-spin" /> : 'حفظ'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                  
                  {/* علامة المشتري المؤكد */}
                  {review.isVerifiedPurchase && (
                    <div className="mt-3 flex items-center">
                      <ThumbsUp className="w-4 h-4 ml-1 text-green-600" />
                      <span className="text-green-600 text-xs font-medium">عملية شراء مؤكدة</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ترقيم الصفحات */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6">
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  // هنا يمكن إضافة منطق لتحميل صفحة جديدة من التقييمات
                  // reviewService.getProductReviews(productId, page)
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-full
                  ${page === pagination.currentPage
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;