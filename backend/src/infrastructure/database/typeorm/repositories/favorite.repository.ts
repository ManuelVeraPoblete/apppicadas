import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteEntity } from '../../../../core/domain/entities/favorite.entity';
import { IFavoriteRepository } from '../../../../core/ports/repositories/favorite.repository.port';
import { FavoriteOrmEntity } from '../entities/favorite.orm-entity';
import { FavoriteMapper } from '../../mappers/favorite.mapper';

@Injectable()
export class FavoriteRepository implements IFavoriteRepository {
  constructor(
    @InjectRepository(FavoriteOrmEntity)
    private readonly repo: Repository<FavoriteOrmEntity>,
  ) {}

  async save(favorite: FavoriteEntity): Promise<FavoriteEntity> {
    const orm = FavoriteMapper.toOrm(favorite);
    const saved = await this.repo.save(orm);
    return FavoriteMapper.toDomain(saved);
  }

  async delete(userId: string, placeId: string): Promise<void> {
    await this.repo.delete({ userId, placeId });
  }

  async findByUserId(userId: string): Promise<FavoriteEntity[]> {
    const orms = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(FavoriteMapper.toDomain);
  }

  async exists(userId: string, placeId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, placeId } });
    return count > 0;
  }
}
