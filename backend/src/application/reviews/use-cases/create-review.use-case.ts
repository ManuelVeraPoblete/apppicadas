import {
  Inject,
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IReviewRepository,
  REVIEW_REPOSITORY,
} from '../../../core/ports/repositories/review.repository.port';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { CreateReviewDto } from '../dtos/review.dto';
import { ReviewEntity } from '../../../core/domain/entities/review.entity';
import { PlaceNotFoundException } from '../../../core/domain/exceptions/domain.exceptions';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { JwtPayload } from '../../../presentation/shared/decorators/current-user.decorator';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(placeId: string, dto: CreateReviewDto, currentUser: JwtPayload): Promise<ReviewEntity> {
    if (currentUser.role !== UserRole.USER) {
      throw new ForbiddenException('Solo los usuarios pueden dejar reseñas');
    }

    const place = await this.placeRepository.findById(placeId);
    if (!place) throw new PlaceNotFoundException(placeId);
    if (!place.isActive) throw new ForbiddenException('No se pueden dejar reseñas en un local inactivo');

    // Un usuario solo puede dejar una reseña por local
    const existing = await this.reviewRepository.findByUserAndPlace(currentUser.sub, placeId);
    if (existing) {
      throw new ConflictException('Ya dejaste una reseña en este local');
    }

    const review = new ReviewEntity(
      uuidv4(),
      placeId,
      currentUser.sub,
      dto.rating,
      new Date(),
      new Date(),
      dto.comment,
      dto.foodQualityScore,
      dto.priceQualityScore,
      dto.serviceScore,
      dto.cleanlinessScore,
    );

    const saved = await this.reviewRepository.save(review);

    // Recalcular y actualizar el rating promedio del local
    const { average, count } = await this.reviewRepository.calculateAverageRating(placeId);
    await this.placeRepository.updateRating(placeId, average, count);

    return saved;
  }
}
