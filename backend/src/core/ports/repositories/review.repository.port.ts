import { ReviewEntity } from '../../domain/entities/review.entity';
import { ReviewReplyEntity } from '../../domain/entities/review-reply.entity';

export interface IReviewRepository {
  save(review: ReviewEntity): Promise<ReviewEntity>;
  findById(id: string): Promise<ReviewEntity | null>;
  findByPlaceId(placeId: string, page: number, limit: number): Promise<{ reviews: ReviewEntity[]; total: number }>;
  findByUserAndPlace(userId: string, placeId: string): Promise<ReviewEntity | null>;
  update(id: string, data: Partial<ReviewEntity>): Promise<ReviewEntity>;
  delete(id: string): Promise<void>;
  saveReply(reply: ReviewReplyEntity): Promise<ReviewReplyEntity>;
  findReplyByReviewId(reviewId: string): Promise<ReviewReplyEntity | null>;
  updateReply(reviewId: string, comment: string): Promise<ReviewReplyEntity>;
  calculateAverageRating(placeId: string): Promise<{ average: number; count: number }>;
}

export const REVIEW_REPOSITORY = Symbol('IReviewRepository');
