import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PlaceEntity } from '../../../../core/domain/entities/place.entity';
import {
  IPlaceRepository,
  NearbyQuery,
  NearbyResult,
} from '../../../../core/ports/repositories/place.repository.port';
import { PlaceOrmEntity } from '../entities/place.orm-entity';
import { PlaceMapper } from '../../mappers/place.mapper';

@Injectable()
export class PlaceRepository implements IPlaceRepository {
  constructor(
    @InjectRepository(PlaceOrmEntity)
    private readonly repo: Repository<PlaceOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async save(place: PlaceEntity): Promise<PlaceEntity> {
    // Usamos query raw para insertar la columna POINT correctamente
    await this.dataSource.query(
      `INSERT INTO places
        (id, name, description, category_id, address, city,
         latitude, longitude, location,
         phone, website, instagram, price_range,
         rating_average, review_count, is_verified, is_active, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?, 4326), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        place.id,
        place.name,
        place.description ?? null,
        place.categoryId,
        place.address,
        place.city,
        place.latitude,
        place.longitude,
        `POINT(${place.longitude} ${place.latitude})`,
        place.phone ?? null,
        place.website ?? null,
        place.instagram ?? null,
        place.priceRange,
        place.ratingAverage,
        place.reviewCount,
        place.isVerified ? 1 : 0,
        place.isActive ? 1 : 0,
        place.createdById,
      ],
    );

    const saved = await this.repo.findOneOrFail({ where: { id: place.id } });
    return PlaceMapper.toDomain(saved);
  }

  async findById(id: string): Promise<PlaceEntity | null> {
    const orm = await this.repo.findOne({ where: { id, isActive: true } });
    return orm ? PlaceMapper.toDomain(orm) : null;
  }

  async findNearby(query: NearbyQuery): Promise<NearbyResult[]> {
    const { lat, lng, radius, categoryId, priceRange } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    // ST_Distance_Sphere es más eficiente que Haversine manual y usa el índice espacial.
    // El filtro HAVING aplica el radio antes de ordenar.
    let sql = `
      SELECT
        p.*,
        ST_Distance_Sphere(
          p.location,
          ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')'), 4326)
        ) AS distance_meters
      FROM places p
      WHERE p.is_active = 1
    `;

    const params: any[] = [lng, lat];

    if (categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    if (priceRange) {
      sql += ' AND p.price_range = ?';
      params.push(priceRange);
    }

    sql += ' HAVING distance_meters <= ? ORDER BY distance_meters ASC LIMIT ? OFFSET ?';
    params.push(radius, limit, offset);

    const rows = await this.dataSource.query(sql, params);

    return rows.map((row: any) => ({
      place: PlaceMapper.toDomain(this.rowToOrm(row)),
      distanceMeters: Number(row.distance_meters),
    }));
  }

  async update(id: string, data: Partial<PlaceEntity>): Promise<PlaceEntity> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.instagram !== undefined) updateData.instagram = data.instagram;
    if (data.priceRange !== undefined) updateData.priceRange = data.priceRange;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    // Si se actualizan coordenadas, recalcular columna POINT
    if (data.latitude !== undefined && data.longitude !== undefined) {
      await this.dataSource.query(
        `UPDATE places SET latitude=?, longitude=?, location=ST_GeomFromText(?, 4326) WHERE id=?`,
        [
          data.latitude,
          data.longitude,
          `POINT(${data.longitude} ${data.latitude})`,
          id,
        ],
      );
    }

    if (Object.keys(updateData).length > 0) {
      await this.repo.update(id, updateData);
    }

    const updated = await this.repo.findOneOrFail({ where: { id } });
    return PlaceMapper.toDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(id, { isActive: false });
  }

  async updateRating(placeId: string, average: number, count: number): Promise<void> {
    await this.repo.update(placeId, {
      ratingAverage: average,
      reviewCount: count,
    });
  }

  async findByOwnerId(ownerId: string): Promise<PlaceEntity | null> {
    const orm = await this.repo.findOne({
      where: { createdById: ownerId, isActive: true },
    });
    return orm ? PlaceMapper.toDomain(orm) : null;
  }

  async findAll(page: number, limit: number): Promise<{ places: PlaceEntity[]; total: number }> {
    const [orms, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { places: orms.map(PlaceMapper.toDomain), total };
  }

  async verifyPlace(id: string): Promise<void> {
    await this.repo.update(id, { isVerified: true });
  }

  // Convierte row de query raw a PlaceOrmEntity parcial para el mapper
  private rowToOrm(row: any): PlaceOrmEntity {
    const orm = new PlaceOrmEntity();
    orm.id = row.id;
    orm.name = row.name;
    orm.description = row.description;
    orm.categoryId = row.category_id;
    orm.address = row.address;
    orm.city = row.city;
    orm.latitude = row.latitude;
    orm.longitude = row.longitude;
    orm.phone = row.phone;
    orm.website = row.website;
    orm.instagram = row.instagram;
    orm.priceRange = row.price_range;
    orm.ratingAverage = row.rating_average;
    orm.reviewCount = row.review_count;
    orm.isVerified = !!row.is_verified;
    orm.isActive = !!row.is_active;
    orm.createdById = row.created_by_id;
    orm.createdAt = row.created_at;
    orm.updatedAt = row.updated_at;
    orm.menuImageUrl = row.menu_image_url ?? null;
    return orm;
  }
}
