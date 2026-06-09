import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessHourEntity } from '../../../../core/domain/entities/business-hour.entity';
import { IBusinessHourRepository } from '../../../../core/ports/repositories/business-hour.repository.port';
import { BusinessHourOrmEntity } from '../entities/business-hour.orm-entity';

@Injectable()
export class BusinessHourRepository implements IBusinessHourRepository {
  constructor(
    @InjectRepository(BusinessHourOrmEntity)
    private readonly repo: Repository<BusinessHourOrmEntity>,
  ) {}

  private toDomain(orm: BusinessHourOrmEntity): BusinessHourEntity {
    return new BusinessHourEntity(
      orm.id,
      orm.placeId,
      orm.dayOfWeek,
      orm.isClosed,
      orm.openTime ?? undefined,
      orm.closeTime ?? undefined,
    );
  }

  async saveMany(hours: BusinessHourEntity[]): Promise<BusinessHourEntity[]> {
    const orms = hours.map((h) => {
      const orm = new BusinessHourOrmEntity();
      orm.id = h.id;
      orm.placeId = h.placeId;
      orm.dayOfWeek = h.dayOfWeek;
      orm.isClosed = h.isClosed;
      orm.openTime = h.openTime ?? null;
      orm.closeTime = h.closeTime ?? null;
      return orm;
    });
    const saved = await this.repo.save(orms);
    return saved.map((o) => this.toDomain(o));
  }

  async findByPlaceId(placeId: string): Promise<BusinessHourEntity[]> {
    const orms = await this.repo.find({
      where: { placeId },
      order: { dayOfWeek: 'ASC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async deleteByPlaceId(placeId: string): Promise<void> {
    await this.repo.delete({ placeId });
  }
}
