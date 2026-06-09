import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import {
  IReviewRepository,
  REVIEW_REPOSITORY,
} from '../../../core/ports/repositories/review.repository.port';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { UpdateReviewDto } from '../dtos/review.dto';
import { ReviewEntity } from '../../../core/domain/entities/review.entity';
import { ReviewNotFoundException } from '../../../core/domain/exceptions/domain.exceptions';
import { JwtPayload } from '../../../presentation/shared/decorators/current-user.decorator';

@Injectable()
export class UpdateReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(reviewId: string, dto: UpdateReviewDto, currentUser: JwtPayload): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new ReviewNotFoundException(reviewId);

    if (review.userId !== currentUser.sub) {
      throw new ForbiddenException('Solo puedes editar tus propias reseñas');
    }

    const updated = await this.reviewRepository.update(reviewId, {
      rating: dto.rating ?? review.rating,
      comment: dto.comment ?? review.comment,
      foodQualityScore: dto.foodQualityScore ?? review.foodQualityScore,
      priceQualityScore: dto.priceQualityScore ?? review.priceQualityScore,
      serviceScore: dto.serviceScore ?? review.serviceScore,
      cleanlinessScore: dto.cleanlinessScore ?? review.cleanlinessScore,
    });

    // Recalcular rating del local
    const { average, count } = await this.reviewRepository.calculateAverageRating(review.placeId);
    await this.placeRepository.updateRating(review.placeId, average, count);

    return updated;
  }
}
