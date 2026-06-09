import { apiClient } from './client';
import { Review, CreateReviewDto } from '../types';

export const reviewsApi = {
  getByPlace: (placeId: string) =>
    apiClient.get<{ data: Review[]; total: number }>(`/places/${placeId}/reviews`).then((r) => r.data.data),

  create: (placeId: string, dto: CreateReviewDto) =>
    apiClient.post<Review>(`/places/${placeId}/reviews`, dto).then((r) => r.data),

  update: (reviewId: string, dto: CreateReviewDto) =>
    apiClient.patch<Review>(`/reviews/${reviewId}`, dto).then((r) => r.data),

  delete: (reviewId: string) =>
    apiClient.delete(`/reviews/${reviewId}`),

  reply: (reviewId: string, comment: string) =>
    apiClient.post(`/reviews/${reviewId}/reply`, { comment }),

  updateReply: (reviewId: string, comment: string) =>
    apiClient.patch(`/reviews/${reviewId}/reply`, { comment }),
};
