// src/types/comment-review.ts
export interface CommentLike {
    id: number;
    commentId: number;
    userId: string;
    createdAt: string;
  }
  
  export interface Comment {
    id: number;
    productId: number;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
    parentCommentId?: number;
    replies?: Comment[];
  }
  
  export interface CreateCommentDto {
    productId: number;
    content: string;
    parentCommentId?: number;
  }
  
  export interface UpdateCommentDto {
    content: string;
  }
  
  export interface Review {
    id: number;
    productId: number;
    userId: string;
    userName: string; // نفس الاسم المستخدم في ReviewResponseDto
    rating: number;
    comment?: string;
    isVerifiedPurchase: boolean;
    createdAt: string;
    updatedAt?: string;
    productName?: string;
  }
  export interface CreateReviewDto {
    productId: number;
    rating: number;
    comment?: string;
  }
  
  export interface UpdateReviewDto {
    rating: number;
    comment?: string;
  }
  
  export interface ReviewSummary {
    productId: number;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }
  
  export interface ReviewsResponse {
    reviews: Review[];
    summary: ReviewSummary;
    pagination: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }