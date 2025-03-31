import React, { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';
import { Comment, UpdateCommentDto } from '../types/comment-review';
import { 
  Loader, 
  MessageSquare,
  Filter, 
  Check, 
  Heart, 
  X, 
  Download,
  Search,
  Edit,
  Reply
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistance } from 'date-fns';
import { ar } from 'date-fns/locale';
import { productService } from '../services/productService';

const AdminCommentsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [uniqueProducts, setUniqueProducts] = useState<{id: number, name: string}[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // جلب التعليقات
 // جلب التعليقات
useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        
        // استخدام دالة جلب جميع التعليقات مباشرة
        const allComments = await commentService.getAllComments();
        
        setComments(allComments);
        setFilteredComments(allComments);
        
        // استخراج المنتجات الفريدة
        const products = allComments.reduce<{id: number, name: string}[]>((acc, comment) => {
          if (!acc.some(p => p.id === comment.productId)) {
            acc.push({
              id: comment.productId,
              name: `منتج #${comment.productId}`
            });
          }
          return acc;
        }, []);
        
        setUniqueProducts(products);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('فشل في تحميل التعليقات');
      } finally {
        setLoading(false);
      }
    };
  
    fetchComments();
  }, []);

  // تطبيق الفلترة على التعليقات
  useEffect(() => {
    let result = [...comments];
    
    // فلترة حسب النص
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        comment => 
          comment.userName.toLowerCase().includes(query) ||
          comment.content.toLowerCase().includes(query)
      );
    }
    
    // فلترة حسب المنتج
    if (selectedProductId !== null) {
      result = result.filter(comment => comment.productId === selectedProductId);
    }
    
    setFilteredComments(result);
  }, [comments, searchQuery, selectedProductId]);

  // دالة حذف تعليق
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
      return;
    }

    try {
      setSubmitting(true);
      await commentService.deleteComment(commentId);
      
      // حذف التعليق من القائمة
      setComments(prev => {
        // تحقق مما إذا كان التعليق الذي سيتم حذفه هو رد على تعليق آخر
        const commentToDelete = prev.find(c => c.id === commentId);
        
        if (commentToDelete && commentToDelete.parentCommentId) {
          // إذا كان ردًا، نبحث عن التعليق الأصلي ونزيل الرد منه
          return prev.map(comment => {
            if (comment.id === commentToDelete.parentCommentId && comment.replies) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== commentId)
              };
            }
            return comment;
          });
        } else {
          // إذا كان تعليقًا رئيسيًا، نزيله تمامًا
          return prev.filter(comment => comment.id !== commentId);
        }
      });
      
      toast.success('تم حذف التعليق بنجاح');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('فشل في حذف التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  // دالة تحديث تعليق
  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) {
      toast.error('لا يمكن حفظ تعليق فارغ');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdateCommentDto = { content: editContent };
      await commentService.updateComment(commentId, updateData);
      
      // تحديث التعليق في القائمة
      setComments(prev => {
        return prev.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content: editContent };
          }
          
          // التحقق من الردود إذا كان التعليق أصليًا
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId ? { ...reply, content: editContent } : reply
              )
            };
          }
          
          return comment;
        });
      });
      
      setEditingCommentId(null);
      setEditContent('');
      toast.success('تم تحديث التعليق بنجاح');
    } catch (err) {
      console.error('Error updating comment:', err);
      toast.error('فشل في تحديث التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  // دالة للإعجاب بتعليق أو إلغاء الإعجاب
  const handleLikeComment = async (commentId: number) => {
    try {
      const result = await commentService.likeComment(commentId);
      
      // تحديث عدد الإعجابات في القائمة
      setComments(prev => {
        return prev.map(comment => {
          if (comment.id === commentId) {
            return { 
              ...comment, 
              likesCount: result.likesCount, 
              isLikedByCurrentUser: result.isLiked 
            };
          }
          
          // التحقق من الردود إذا كان التعليق أصليًا
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId ? { 
                  ...reply, 
                  likesCount: result.likesCount, 
                  isLikedByCurrentUser: result.isLiked 
                } : reply
              )
            };
          }
          
          return comment;
        });
      });
      
      toast.success(result.isLiked ? 'تم الإعجاب بالتعليق' : 'تم إلغاء الإعجاب');
    } catch (err) {
      console.error('Error liking comment:', err);
      toast.error('حدث خطأ أثناء تحديث الإعجاب');
    }
  };

  // تنسيق التاريخ
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

  // تصدير البيانات
  const exportComments = () => {
    const headers = [
      'معرف التعليق',
      'المستخدم',
      'المنتج',
      'التعليق',
      'عدد الإعجابات',
      'تاريخ الإنشاء',
      'نوع التعليق'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredComments.map(comment => [
        comment.id,
        comment.userName,
        `منتج #${comment.productId}`,
        `"${comment.content.replace(/"/g, '""')}"`,
        comment.likesCount,
        formatDate(comment.createdAt),
        comment.parentCommentId ? 'رد' : 'تعليق أصلي'
      ].join(','))
    ].join('\n');
    
    // إنشاء رابط للتنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `comments-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && comments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 rtl" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة التعليقات</h1>
        <button
          onClick={exportComments}
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

          {/* فلتر المنتج */}
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">المنتج</label>
            <select
              value={selectedProductId !== null ? selectedProductId : ''}
              onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : null)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">كل المنتجات</option>
              {uniqueProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* زر إعادة ضبط الفلاتر */}
          <div className="w-full sm:w-auto flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedProductId(null);
              }}
              className="w-full sm:w-auto p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* جدول التعليقات */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المستخدم</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المنتج</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">التعليق</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإعجابات</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ الإنشاء</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    لا توجد تعليقات متطابقة مع الفلاتر المحددة
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <tr className={`hover:bg-gray-50 ${comment.parentCommentId ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{comment.userName}</div>
                        <div className="text-gray-500 text-xs">{comment.userId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">منتج #{comment.productId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingCommentId === comment.id ? (
                          <div>
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={2}
                            ></textarea>
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditContent('');
                                }}
                                className="px-2 py-1 bg-gray-200 rounded text-gray-700 text-xs"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={() => handleUpdateComment(comment.id)}
                                className="px-2 py-1 bg-blue-600 rounded text-white text-xs"
                                disabled={submitting}
                              >
                                حفظ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {comment.parentCommentId && (
                              <div className="flex items-center text-xs text-gray-500 mb-1">
                                <Reply className="w-3 h-3 ml-1 rotate-180" />
                                رد على تعليق #{comment.parentCommentId}
                              </div>
                            )}
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <Heart className={`w-4 h-4 mr-1 ${comment.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          <span>{comment.likesCount}</span>
                          <button 
                            onClick={() => handleLikeComment(comment.id)}
                            className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            {comment.isLikedByCurrentUser ? 'إلغاء الإعجاب' : 'إعجاب'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditContent(comment.content);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-800"
                            title="حذف"
                            disabled={submitting}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* عرض الردود إذا كانت موجودة */}
                    {comment.replies && comment.replies.map(reply => (
                      <tr key={reply.id} className="bg-gray-50 hover:bg-gray-100">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{reply.userName}</div>
                          <div className="text-gray-500 text-xs">{reply.userId}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">منتج #{reply.productId}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingCommentId === reply.id ? (
                            <div>
                              <textarea
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={2}
                              ></textarea>
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditContent('');
                                  }}
                                  className="px-2 py-1 bg-gray-200 rounded text-gray-700 text-xs"
                                >
                                  إلغاء
                                </button>
                                <button
                                  onClick={() => handleUpdateComment(reply.id)}
                                  className="px-2 py-1 bg-blue-600 rounded text-white text-xs"
                                  disabled={submitting}
                                >
                                  حفظ
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center text-xs text-gray-500 mb-1">
                                <Reply className="w-3 h-3 ml-1 rotate-180" />
                                رد على تعليق #{reply.parentCommentId}
                              </div>
                              <p className="text-gray-700">{reply.content}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <Heart className={`w-4 h-4 mr-1 ${reply.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            <span>{reply.likesCount}</span>
                            <button 
                              onClick={() => handleLikeComment(reply.id)}
                              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              {reply.isLikedByCurrentUser ? 'إلغاء الإعجاب' : 'إعجاب'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(reply.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex space-x-2 space-x-reverse">
                            <button
                              onClick={() => {
                                setEditingCommentId(reply.id);
                                setEditContent(reply.content);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(reply.id)}
                              className="text-red-600 hover:text-red-800"
                              title="حذف"
                              disabled={submitting}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCommentsPage;