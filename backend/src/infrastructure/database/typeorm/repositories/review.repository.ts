import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from '../../../../core/domain/entities/review.entity';
import { ReviewReplyEntity } from '../../../../core/domain/entities/review-reply.entity';
import { IReviewRepository } from '../../../../core/ports/repositories/review.repository.port';
import { ReviewOrmEntity } from '../entities/review.orm-entity';
import { ReviewReplyOrmEntity } from '../entities/review-reply.orm-entity';
import { ReviewMapper, ReviewReplyMapper } from '../../mappers/review.mapper';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly reviewRepo: Repository<ReviewOrmEntity>,
    @InjectRepository(ReviewReplyOrmEntity)
    private readonly replyRepo: Repository<ReviewReplyOrmEntity>,
  ) {}

  async save(review: ReviewEntity): Promise<ReviewEntity> {
    const orm = ReviewMapper.toOrm(review);
    const saved = await this.reviewRepo.save(orm);
    return ReviewMapper.toDomain(saved);
  }

  async findById(id: string): Promise<ReviewEntity | null> {
    const orm = await this.reviewRepo.findOne({ where: { id } });
    return orm ? ReviewMapper.toDomain(orm) : null;
  }

  async findByPlaceId(
    placeId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: ReviewEntity[]; total: number }> {
    const [orms, total] = await this.reviewRepo.findAndCount({
      where: { placeId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { reviews: orms.map(ReviewMapper.toDomain), total };
  }

  async findByUserAndPlace(userId: string, placeId: string): Promise<ReviewEntity | null> {
    const orm = await this.reviewRepo.findOne({ where: { userId, placeId } });
    return orm ? ReviewMapper.toDomain(orm) : null;
  }

  async update(id: string, data: Partial<ReviewEntity>): Promise<ReviewEntity> {
    await this.reviewRepo.update(id, {
      rating: data.rating,
      comment: data.comment ?? null,
      foodQualityScore: data.foodQualityScore ?? null,
      priceQualityScore: data.priceQualityScore ?? null,
      serviceScore: data.serviceScore ?? null,
      cleanlinessScore: data.cleanlinessScore ?? null,
    });
    const updated = await this.reviewRepo.findOneOrFail({ where: { id } });
    return ReviewMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.reviewRepo.delete(id);
  }

  async saveReply(reply: ReviewReplyEntity): Promise<ReviewReplyEntity> {
    const orm = ReviewReplyMapper.toOrm(reply);
    const saved = await this.replyRepo.save(orm);
    return ReviewReplyMapper.toDomain(saved);
  }

  async findReplyByReviewId(reviewId: string): Promise<ReviewReplyEntity | null> {
    const orm = await this.replyRepo.findOne({ where: { reviewId } });
    return orm ? ReviewReplyMapper.toDomain(orm) : null;
  }

  async updateReply(reviewId: string, comment: string): Promise<ReviewReplyEntity> {
    await this.replyRepo.update({ reviewId }, { comment });
    const updated = await this.replyRepo.findOneOrFail({ where: { reviewId } });
    return ReviewReplyMapper.toDomain(updated);
  }

  // Recalcula promedio y total de reseñas de un local — se llama tras crear/editar/borrar
  async calculateAverageRating(placeId: string): Promise<{ average: number; count: number }> {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'average')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.placeId = :placeId', { placeId })
      .getRawOne();

    return {
      average: result.average ? Number(Number(result.average).toFixed(2)) : 0,
      count: Number(result.count) || 0,
    };
  }
}
