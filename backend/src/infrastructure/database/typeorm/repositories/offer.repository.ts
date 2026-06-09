import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { OfferEntity } from '../../../../core/domain/entities/offer.entity';
import { IOfferRepository } from '../../../../core/ports/repositories/offer.repository.port';
import { OfferOrmEntity } from '../entities/offer.orm-entity';

@Injectable()
export class OfferRepository implements IOfferRepository {
  constructor(
    @InjectRepository(OfferOrmEntity)
    private readonly repo: Repository<OfferOrmEntity>,
  ) {}

  private toDomain(orm: OfferOrmEntity): OfferEntity {
    return new OfferEntity(
      orm.id,
      orm.placeId,
      orm.title,
      orm.discountType,
      Number(orm.discountValue),
      orm.validFrom,
      orm.validTo,
      orm.isActive,
      orm.createdAt,
      orm.description ?? undefined,
      orm.imageUrl ?? undefined,
    );
  }

  async save(offer: OfferEntity): Promise<OfferEntity> {
    const orm = new OfferOrmEntity();
    orm.id = offer.id;
    orm.placeId = offer.placeId;
    orm.title = offer.title;
    orm.discountType = offer.discountType;
    orm.discountValue = offer.discountValue;
    orm.validFrom = offer.validFrom;
    orm.validTo = offer.validTo;
    orm.isActive = offer.isActive;
    orm.description = offer.description ?? null;
    orm.imageUrl = offer.imageUrl ?? null;
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async findByPlaceId(placeId: string, onlyActive = false): Promise<OfferEntity[]> {
    const now = new Date();
    const where: any = { placeId };
    if (onlyActive) {
      where.isActive = true;
      where.validFrom = LessThanOrEqual(now);
      where.validTo = MoreThanOrEqual(now);
    }
    const orms = await this.repo.find({ where, order: { validTo: 'ASC' } });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: string): Promise<OfferEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async update(id: string, data: Partial<OfferEntity>): Promise<OfferEntity> {
    await this.repo.update(id, {
      title: data.title,
      description: data.description ?? null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      validFrom: data.validFrom,
      validTo: data.validTo,
      isActive: data.isActive,
      imageUrl: data.imageUrl ?? null,
    });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
