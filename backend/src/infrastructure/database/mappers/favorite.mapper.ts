import { FavoriteEntity } from '../../../core/domain/entities/favorite.entity';
import { FavoriteOrmEntity } from '../typeorm/entities/favorite.orm-entity';

export class FavoriteMapper {
  static toDomain(orm: FavoriteOrmEntity): FavoriteEntity {
    return new FavoriteEntity(orm.id, orm.userId, orm.placeId, orm.createdAt);
  }

  static toOrm(domain: FavoriteEntity): FavoriteOrmEntity {
    const orm = new FavoriteOrmEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.placeId = domain.placeId;
    return orm;
  }
}
