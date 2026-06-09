import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  IReviewRepository,
  REVIEW_REPOSITORY,
} from '../../../core/ports/repositories/review.repository.port';
import { CreateReplyDto } from '../dtos/review.dto';
import { ReviewReplyEntity } from '../../../core/domain/entities/review-reply.entity';
import { JwtPayload } from '../../../presentation/shared/decorators/current-user.decorator';

@Injectable()
export class UpdateReplyUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(
    reviewId: string,
    dto: CreateReplyDto,
    currentUser: JwtPayload,
  ): Promise<ReviewReplyEntity> {
    const reply = await this.reviewRepository.findReplyByReviewId(reviewId);
    if (!reply) throw new NotFoundException('Respuesta no encontrada');

    if (reply.ownerId !== currentUser.sub) {
      throw new ForbiddenException('Solo puedes editar tu propia respuesta');
    }

    return this.reviewRepository.updateReply(reviewId, dto.comment);
  }
}
