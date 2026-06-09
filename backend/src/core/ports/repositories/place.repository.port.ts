import { PlaceEntity } from '../../domain/entities/place.entity';

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius: number;
  categoryId?: string;
  priceRange?: string;
  page?: number;
  limit?: number;
}

export interface NearbyResult {
  place: PlaceEntity;
  distanceMeters: number;
}

export interface IPlaceRepository {
  save(place: PlaceEntity): Promise<PlaceEntity>;
  findById(id: string): Promise<PlaceEntity | null>;
  findNearby(query: NearbyQuery): Promise<NearbyResult[]>;
  update(id: string, data: Partial<PlaceEntity>): Promise<PlaceEntity>;
  softDelete(id: string): Promise<void>;
  updateRating(placeId: string, average: number, count: number): Promise<void>;
  findByOwnerId(ownerId: string): Promise<PlaceEntity | null>;
  findAll(page: number, limit: number): Promise<{ places: PlaceEntity[]; total: number }>;
  verifyPlace(id: string): Promise<void>;
}

export const PLACE_REPOSITORY = Symbol('IPlaceRepository');
