// src/services/reviewService.ts
import api, { handleApiError } from '../config/apiConfig';
import { 
  Review, 
  CreateReviewDto, 
  UpdateReviewDto, 
  ReviewSummary, 
  ReviewsResponse 
} from '../types/comment-review';
import { AxiosError } from 'axios';

class ReviewService {
  private readonly basePath = '/ProductReviews';

  /**
   * جلب تقييمات منتج معين مع الملخص والترقيم
   */
  async getProductReviews(
    productId: number, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<ReviewsResponse> {
    try {
      const response = await api.get<ReviewsResponse>(
        `${this.basePath}/product/${productId}`,
        { params: { page, pageSize } }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * جلب ملخص تقييمات المنتج (بدون التقييمات نفسها)
   */
  async getProductReviewSummary(productId: number): Promise<ReviewSummary> {
    try {
      const response = await api.get<ReviewSummary>(`${this.basePath}/product/${productId}/summary`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * إضافة تقييم جديد للمنتج
   */
  async addReview(reviewData: CreateReviewDto): Promise<Review> {
    try {
      const response = await api.post<Review>(this.basePath, reviewData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * تحديث تقييم
   */
  async updateReview(reviewId: number, reviewData: UpdateReviewDto): Promise<void> {
    try {
      await api.put(`${this.basePath}/${reviewId}`, reviewData);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * حذف تقييم
   */
  async deleteReview(reviewId: number): Promise<void> {
    try {
      await api.delete(`${this.basePath}/${reviewId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * التحقق ما إذا كان المستخدم قد قام بتقييم المنتج
   */
  async hasUserReviewedProduct(productId: number): Promise<boolean> {
    try {
      const response = await api.get<{ hasReviewed: boolean }>(`${this.basePath}/user/reviewed/${productId}`);
      return response.data.hasReviewed;
    } catch (error: unknown) {
      // في حالة عدم تسجيل دخول المستخدم، سيرجع false
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      throw handleApiError(error);
    }
  }

  // الحصول على جميع التقييمات للوحة الإدارة
async getAllReviews(page: number = 1, pageSize: number = 50): Promise<ReviewsResponse> {
    try {
      const response = await api.get<ReviewsResponse>(`${this.basePath}/admin/all`, {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * جلب تقييمات المستخدم الحالي
   */
  async getUserReviews(page: number = 1, pageSize: number = 10): Promise<{
    reviews: Review[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    }
  }> {
    try {
      const response = await api.get(`${this.basePath}/user`, {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const reviewService = new ReviewService();