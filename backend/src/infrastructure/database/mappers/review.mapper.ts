import { ReviewEntity } from '../../../core/domain/entities/review.entity';
import { ReviewReplyEntity } from '../../../core/domain/entities/review-reply.entity';
import { ReviewOrmEntity } from '../typeorm/entities/review.orm-entity';
import { ReviewReplyOrmEntity } from '../typeorm/entities/review-reply.orm-entity';

export class ReviewMapper {
  static toDomain(orm: ReviewOrmEntity): ReviewEntity {
    return new ReviewEntity(
      orm.id,
      orm.placeId,
      orm.userId,
      orm.rating,
      orm.createdAt,
      orm.updatedAt,
      orm.comment ?? undefined,
      orm.foodQualityScore ?? undefined,
      orm.priceQualityScore ?? undefined,
      orm.serviceScore ?? undefined,
      orm.cleanlinessScore ?? undefined,
      orm.user?.name ?? undefined,
    );
  }

  static toOrm(domain: ReviewEntity): ReviewOrmEntity {
    const orm = new ReviewOrmEntity();
    orm.id = domain.id;
    orm.placeId = domain.placeId;
    orm.userId = domain.userId;
    orm.rating = domain.rating;
    orm.comment = domain.comment ?? null;
    orm.foodQualityScore = domain.foodQualityScore ?? null;
    orm.priceQualityScore = domain.priceQualityScore ?? null;
    orm.serviceScore = domain.serviceScore ?? null;
    orm.cleanlinessScore = domain.cleanlinessScore ?? null;
    return orm;
  }
}

export class ReviewReplyMapper {
  static toDomain(orm: ReviewReplyOrmEntity): ReviewReplyEntity {
    return new ReviewReplyEntity(
      orm.id,
      orm.reviewId,
      orm.ownerId,
      orm.comment,
      orm.createdAt,
    );
  }

  static toOrm(domain: ReviewReplyEntity): ReviewReplyOrmEntity {
    const orm = new ReviewReplyOrmEntity();
    orm.id = domain.id;
    orm.reviewId = domain.reviewId;
    orm.ownerId = domain.ownerId;
    orm.comment = domain.comment;
    return orm;
  }
}
