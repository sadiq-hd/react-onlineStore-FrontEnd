// src/services/commentService.ts
import api, { handleApiError } from '../config/apiConfig';
import { Comment, CreateCommentDto, UpdateCommentDto } from '../types/comment-review';

class CommentService {
    private readonly basePath = '/ProductComments';

  /**
   * جلب تعليقات منتج معين
   */
  async getProductComments(productId: number): Promise<Comment[]> {
    try {
      const response = await api.get<Comment[]>(`${this.basePath}/product/${productId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getAllComments(): Promise<Comment[]> {
    try {
      const response = await api.get<Comment[]>(`${this.basePath}/admin/all`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * إضافة تعليق جديد للمنتج
   */
  async addComment(commentData: CreateCommentDto): Promise<Comment> {
    try {
      const response = await api.post<Comment>(this.basePath, commentData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * تحديث تعليق
   */
  async updateComment(commentId: number, commentData: UpdateCommentDto): Promise<void> {
    try {
      await api.put(`${this.basePath}/${commentId}`, commentData);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * حذف تعليق
   */
  async deleteComment(commentId: number): Promise<void> {
    try {
      await api.delete(`${this.basePath}/${commentId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * الإعجاب بتعليق أو إلغاء الإعجاب
   */
  async likeComment(commentId: number): Promise<{ likesCount: number, isLiked: boolean }> {
    try {
      const response = await api.post<{ likesCount: number, isLiked: boolean }>(`${this.basePath}/${commentId}/like`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const commentService = new CommentService();