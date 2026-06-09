import { FavoriteEntity } from '../../domain/entities/favorite.entity';

export interface IFavoriteRepository {
  save(favorite: FavoriteEntity): Promise<FavoriteEntity>;
  delete(userId: string, placeId: string): Promise<void>;
  findByUserId(userId: string): Promise<FavoriteEntity[]>;
  exists(userId: string, placeId: string): Promise<boolean>;
}

export const FAVORITE_REPOSITORY = Symbol('IFavoriteRepository');
