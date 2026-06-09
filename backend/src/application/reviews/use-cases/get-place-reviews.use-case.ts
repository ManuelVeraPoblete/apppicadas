import { Inject, Injectable } from '@nestjs/common';
import {
  IReviewRepository,
  REVIEW_REPOSITORY,
} from '../../../core/ports/repositories/review.repository.port';
import { ReviewEntity } from '../../../core/domain/entities/review.entity';
import { ReviewReplyEntity } from '../../../core/domain/entities/review-reply.entity';

export interface ReviewWithReply {
  review: ReviewEntity;
  reply: ReviewReplyEntity | null;
}

@Injectable()
export class GetPlaceReviewsUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(
    placeId: string,
    page: number,
    limit: number,
  ): Promise<{ data: ReviewWithReply[]; total: number }> {
    const { reviews, total } = await this.reviewRepository.findByPlaceId(placeId, page, limit);

    // Para cada reseña cargamos su respuesta si existe
    const data = await Promise.all(
      reviews.map(async (review) => {
        const reply = await this.reviewRepository.findReplyByReviewId(review.id);
        return { review, reply };
      }),
    );

    return { data, total };
  }
}
