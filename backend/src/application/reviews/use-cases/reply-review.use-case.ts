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
import { CreateReplyDto } from '../dtos/review.dto';
import { ReviewReplyEntity } from '../../../core/domain/entities/review-reply.entity';
import { ReviewNotFoundException } from '../../../core/domain/exceptions/domain.exceptions';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { JwtPayload } from '../../../presentation/shared/decorators/current-user.decorator';

@Injectable()
export class ReplyReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(
    reviewId: string,
    dto: CreateReplyDto,
    currentUser: JwtPayload,
  ): Promise<ReviewReplyEntity> {
    if (currentUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Solo el dueño del local puede responder reseñas');
    }

    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new ReviewNotFoundException(reviewId);

    // Verificar que el OWNER es dueño del local de esta reseña
    const place = await this.placeRepository.findById(review.placeId);
    if (!place || place.createdById !== currentUser.sub) {
      throw new ForbiddenException('Solo puedes responder reseñas de tu propio local');
    }

    // Solo se permite una respuesta por reseña
    const existing = await this.reviewRepository.findReplyByReviewId(reviewId);
    if (existing) {
      throw new ConflictException('Esta reseña ya tiene una respuesta');
    }

    const reply = new ReviewReplyEntity(
      uuidv4(),
      reviewId,
      currentUser.sub,
      dto.comment,
      new Date(),
    );

    return this.reviewRepository.saveReply(reply);
  }
}
