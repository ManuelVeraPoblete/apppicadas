import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { CreateReviewUseCase } from '../../application/reviews/use-cases/create-review.use-case';
import { GetPlaceReviewsUseCase } from '../../application/reviews/use-cases/get-place-reviews.use-case';
import { UpdateReviewUseCase } from '../../application/reviews/use-cases/update-review.use-case';
import { DeleteReviewUseCase } from '../../application/reviews/use-cases/delete-review.use-case';
import { ReplyReviewUseCase } from '../../application/reviews/use-cases/reply-review.use-case';
import { UpdateReplyUseCase } from '../../application/reviews/use-cases/update-reply.use-case';
import { ReviewRepository } from '../../infrastructure/database/typeorm/repositories/review.repository';
import { PlaceRepository } from '../../infrastructure/database/typeorm/repositories/place.repository';
import { ReviewOrmEntity } from '../../infrastructure/database/typeorm/entities/review.orm-entity';
import { ReviewReplyOrmEntity } from '../../infrastructure/database/typeorm/entities/review-reply.orm-entity';
import { PlaceOrmEntity } from '../../infrastructure/database/typeorm/entities/place.orm-entity';
import { REVIEW_REPOSITORY } from '../../core/ports/repositories/review.repository.port';
import { PLACE_REPOSITORY } from '../../core/ports/repositories/place.repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewOrmEntity, ReviewReplyOrmEntity, PlaceOrmEntity]),
  ],
  controllers: [ReviewsController],
  providers: [
    CreateReviewUseCase,
    GetPlaceReviewsUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
    ReplyReviewUseCase,
    UpdateReplyUseCase,
    { provide: REVIEW_REPOSITORY, useClass: ReviewRepository },
    { provide: PLACE_REPOSITORY, useClass: PlaceRepository },
  ],
})
export class ReviewsModule {}
