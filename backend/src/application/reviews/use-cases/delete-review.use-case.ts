import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import {
  IReviewRepository,
  REVIEW_REPOSITORY,
} from '../../../core/ports/repositories/review.repository.port';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { ReviewNotFoundException } from '../../../core/domain/exceptions/domain.exceptions';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { JwtPayload } from '../../../presentation/shared/decorators/current-user.decorator';

@Injectable()
export class DeleteReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(reviewId: string, currentUser: JwtPayload): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new ReviewNotFoundException(reviewId);

    const isAuthor = review.userId === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('Solo puedes eliminar tus propias reseñas');
    }

    const placeId = review.placeId;
    await this.reviewRepository.delete(reviewId);

    // Recalcular rating tras borrar
    const { average, count } = await this.reviewRepository.calculateAverageRating(placeId);
    await this.placeRepository.updateRating(placeId, average, count);
  }
}
