// src/components/comments/CommentSection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Comment, CreateCommentDto } from '../../types/comment-review';
import { commentService } from '../../services/commentService';
import { formatDistance } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  MessageSquare, 
  Heart, 
  CornerUpLeft, 
  Trash, 
  Edit,
  Send,
  X,
  Loader
} from 'lucide-react';
import { toast } from 'react-toastify';

interface CommentSectionProps {
  productId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ productId }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // جلب التعليقات من الخادم
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await commentService.getProductComments(productId);
        setComments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('فشل في تحميل التعليقات');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [productId]);

  // دالة لتنسيق التاريخ
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

  // دالة إرسال تعليق جديد
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (!comment.trim()) {
      toast.error('الرجاء كتابة تعليق');
      return;
    }

    try {
      setSubmitting(true);
      const newCommentData: CreateCommentDto = {
        productId,
        content: comment.trim()
      };

      const newComment = await commentService.addComment(newCommentData);
      setComments(prev => [newComment, ...prev]);
      setComment('');
      toast.success('تم إضافة التعليق بنجاح');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('فشل في إضافة التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  // دالة إرسال رد على تعليق
  const handleSubmitReply = async (parentCommentId: number) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('الرجاء كتابة رد');
      return;
    }

    try {
      setSubmitting(true);
      const replyData: CreateCommentDto = {
        productId,
        content: replyContent.trim(),
        parentCommentId
      };

      const newReply = await commentService.addComment(replyData);
      
      // تحديث التعليقات لإضافة الرد
      setComments(prev => prev.map(comment => {
        if (comment.id === parentCommentId) {
          const updatedReplies = comment.replies ? [...comment.replies, newReply] : [newReply];
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      }));
      
      setReplyTo(null);
      setReplyContent('');
      toast.success('تم إضافة الرد بنجاح');
    } catch (err) {
      console.error('Error adding reply:', err);
      toast.error('فشل في إضافة الرد');
    } finally {
      setSubmitting(false);
    }
  };

  // دالة حذف تعليق
  const handleDeleteComment = async (commentId: number, isReply?: boolean, parentId?: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
      return;
    }

    try {
      setSubmitting(true);
      await commentService.deleteComment(commentId);

      if (isReply && parentId) {
        // حذف رد من التعليق الأصلي
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== commentId)
            };
          }
          return comment;
        }));
      } else {
        // حذف التعليق الأصلي
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }

      toast.success('تم حذف التعليق بنجاح');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('فشل في حذف التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  // دالة تحديث تعليق
  const handleUpdateComment = async (commentId: number, isReply?: boolean, parentId?: number) => {
    if (!editContent.trim()) {
      toast.error('لا يمكن حفظ تعليق فارغ');
      return;
    }

    try {
      setSubmitting(true);
      await commentService.updateComment(commentId, { content: editContent });

      if (isReply && parentId) {
        // تحديث رد في التعليق الأصلي
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId ? { ...reply, content: editContent } : reply
              )
            };
          }
          return comment;
        }));
      } else {
        // تحديث التعليق الأصلي
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? { ...comment, content: editContent } : comment
        ));
      }

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

  // دالة الإعجاب بتعليق
  const handleLikeComment = async (commentId: number, isReply?: boolean, parentId?: number) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    try {
      const result = await commentService.likeComment(commentId);

      if (isReply && parentId) {
        // تحديث الإعجاب برد
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId 
                  ? { 
                      ...reply, 
                      likesCount: result.likesCount,
                      isLikedByCurrentUser: result.isLiked 
                    } 
                  : reply
              )
            };
          }
          return comment;
        }));
      } else {
        // تحديث الإعجاب بالتعليق الأصلي
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                likesCount: result.likesCount,
                isLikedByCurrentUser: result.isLiked 
              } 
            : comment
        ));
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      toast.error('فشل في تسجيل الإعجاب');
    }
  };

  // التحقق إذا كان التعليق للمستخدم الحالي
  const isCurrentUserComment = (userId: string) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser && userId === currentUser.id;
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <MessageSquare className="inline-block ml-2 text-purple-600" />
        التعليقات ({comments.length})
      </h2>

      {/* نموذج إضافة تعليق جديد */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="mb-3">
          <textarea
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white resize-none"
            placeholder="اكتب تعليقك هنا..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white
              ${submitting || !comment.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {submitting ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            إرسال التعليق
          </button>
        </div>
      </form>

      {/* قائمة التعليقات */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          لا يوجد تعليقات بعد. كن أول من يعلق!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4 mb-4">
              {/* رأس التعليق - اسم المستخدم والوقت */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 ml-3">
                    <span className="text-purple-600 font-bold">
                      {comment.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{comment.userName}</h3>
                    <p className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                {isCurrentUserComment(comment.userId) && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-600"
                      title="حذف"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* محتوى التعليق */}
              {editingCommentId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 bg-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-300"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => handleUpdateComment(comment.id)}
                      className="px-3 py-1 bg-blue-500 rounded-lg text-white text-sm hover:bg-blue-600"
                      disabled={submitting}
                    >
                      {submitting ? <Loader className="animate-spin w-4 h-4" /> : 'حفظ'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mb-3">{comment.content}</p>
              )}

              {/* أزرار التفاعل */}
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1 hover:text-purple-600 ml-4 ${
                    comment.isLikedByCurrentUser ? 'text-purple-600 font-medium' : ''
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${comment.isLikedByCurrentUser ? 'fill-purple-600' : ''}`}
                  />
                  <span>{comment.likesCount}</span>
                </button>
                <button
onClick={() => {
    if (replyTo === comment.id) {
      setReplyTo(null);
      setReplyContent('');
    } else {
      setReplyTo(comment.id);
      setReplyContent('');
    }
  }}
  className="flex items-center gap-1 hover:text-purple-600"
>
  <CornerUpLeft className="w-4 h-4" />
  <span>رد</span>
</button>
</div>

{/* نموذج الرد على التعليق */}
{replyTo === comment.id && (
<div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
  <div className="flex items-center text-gray-500 text-sm mb-2">
    <CornerUpLeft className="w-4 h-4 ml-1" />
    <span>الرد على {comment.userName}</span>
  </div>
  <textarea
    className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm"
    placeholder="اكتب ردك هنا..."
    value={replyContent}
    onChange={(e) => setReplyContent(e.target.value)}
    rows={2}
  ></textarea>
  <div className="flex justify-end gap-2">
    <button
      onClick={() => {
        setReplyTo(null);
        setReplyContent('');
      }}
      className="px-3 py-1 bg-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-300 flex items-center gap-1"
    >
      <X className="w-3 h-3" /> إلغاء
    </button>
    <button
      onClick={() => handleSubmitReply(comment.id)}
      disabled={submitting || !replyContent.trim()}
      className={`px-3 py-1 rounded-lg text-white text-sm flex items-center gap-1
        ${submitting || !replyContent.trim()
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700'}`}
    >
      {submitting ? <Loader className="animate-spin w-3 h-3" /> : <Send className="w-3 h-3" />} إرسال
    </button>
  </div>
</div>
)}

{/* الردود على التعليق */}
{comment.replies && comment.replies.length > 0 && (
<div className="mt-4 pr-6 border-r-2 border-purple-100">
  {comment.replies.map((reply) => (
    <div key={reply.id} className="bg-white rounded-lg p-3 mb-2 border border-gray-100">
      {/* رأس الرد */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="bg-blue-50 rounded-full p-1.5 ml-2">
            <span className="text-blue-600 font-bold text-xs">
              {reply.userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 text-sm">{reply.userName}</h4>
            <p className="text-gray-500 text-xs">{formatDate(reply.createdAt)}</p>
          </div>
        </div>
        {isCurrentUserComment(reply.userId) && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setEditingCommentId(reply.id);
                setEditContent(reply.content);
              }}
              className="text-blue-500 hover:text-blue-600"
              title="تعديل"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button 
              onClick={() => handleDeleteComment(reply.id, true, comment.id)}
              className="text-red-500 hover:text-red-600"
              title="حذف"
            >
              <Trash className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* محتوى الرد */}
      {editingCommentId === reply.id ? (
        <div className="mt-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
          ></textarea>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditingCommentId(null);
                setEditContent('');
              }}
              className="px-3 py-1 bg-gray-200 rounded-lg text-gray-700 text-xs hover:bg-gray-300"
            >
              إلغاء
            </button>
            <button
              onClick={() => handleUpdateComment(reply.id, true, comment.id)}
              className="px-3 py-1 bg-blue-500 rounded-lg text-white text-xs hover:bg-blue-600"
              disabled={submitting}
            >
              {submitting ? <Loader className="animate-spin w-3 h-3" /> : 'حفظ'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 text-sm">{reply.content}</p>
      )}

      {/* أزرار التفاعل للرد */}
      <div className="flex items-center mt-2 text-xs text-gray-600">
        <button
          onClick={() => handleLikeComment(reply.id, true, comment.id)}
          className={`flex items-center gap-1 hover:text-purple-600 ${
            reply.isLikedByCurrentUser ? 'text-purple-600 font-medium' : ''
          }`}
        >
          <Heart
            className={`w-3 h-3 ${reply.isLikedByCurrentUser ? 'fill-purple-600' : ''}`}
          />
          <span>{reply.likesCount}</span>
        </button>
      </div>
    </div>
  ))}
</div>
)}
</div>
))}
</div>
)}
</div>
);
};

export default CommentSection;