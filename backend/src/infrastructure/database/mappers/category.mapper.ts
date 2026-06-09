import { CategoryEntity } from '../../../core/domain/entities/category.entity';
import { CategoryOrmEntity } from '../typeorm/entities/category.orm-entity';

export class CategoryMapper {
  static toDomain(orm: CategoryOrmEntity): CategoryEntity {
    return new CategoryEntity(
      orm.id,
      orm.name,
      orm.slug,
      orm.isActive,
      orm.createdAt,
      orm.icon ?? undefined,
    );
  }

  static toOrm(domain: CategoryEntity): CategoryOrmEntity {
    const orm = new CategoryOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.slug = domain.slug;
    orm.isActive = domain.isActive;
    orm.icon = domain.icon ?? null;
    return orm;
  }
}
