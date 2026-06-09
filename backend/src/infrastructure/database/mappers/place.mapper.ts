import { PlaceEntity } from '../../../core/domain/entities/place.entity';
import { PlaceOrmEntity } from '../typeorm/entities/place.orm-entity';

export class PlaceMapper {
  static toDomain(orm: PlaceOrmEntity): PlaceEntity {
    return new PlaceEntity(
      orm.id,
      orm.name,
      orm.categoryId,
      orm.address,
      orm.city,
      Number(orm.latitude),
      Number(orm.longitude),
      orm.priceRange,
      orm.createdById,
      orm.isActive,
      orm.isVerified,
      Number(orm.ratingAverage),
      orm.reviewCount,
      orm.createdAt,
      orm.updatedAt,
      orm.description ?? undefined,
      orm.phone ?? undefined,
      orm.website ?? undefined,
      orm.instagram ?? undefined,
      orm.menuImageUrl ?? undefined,
    );
  }

  static toOrm(domain: PlaceEntity): Partial<PlaceOrmEntity> {
    return {
      id: domain.id,
      name: domain.name,
      categoryId: domain.categoryId,
      address: domain.address,
      city: domain.city,
      latitude: domain.latitude,
      longitude: domain.longitude,
      // Columna POINT generada via raw expression en el repositorio
      priceRange: domain.priceRange,
      createdById: domain.createdById,
      isActive: domain.isActive,
      isVerified: domain.isVerified,
      ratingAverage: domain.ratingAverage,
      reviewCount: domain.reviewCount,
      description: domain.description ?? null,
      phone: domain.phone ?? null,
      website: domain.website ?? null,
      instagram: domain.instagram ?? null,
      menuImageUrl: domain.menuImageUrl ?? null,
    };
  }
}
