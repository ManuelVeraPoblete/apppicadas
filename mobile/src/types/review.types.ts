export interface Review {
  id: string;
  placeId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  reply?: ReviewReply;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  ownerId: string;
  comment: string;
  createdAt: string;
}

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}
