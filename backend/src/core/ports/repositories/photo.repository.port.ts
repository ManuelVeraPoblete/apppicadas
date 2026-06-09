import { PlacePhotoEntity } from '../../domain/entities/place-photo.entity';

export interface IPhotoRepository {
  save(photo: PlacePhotoEntity): Promise<PlacePhotoEntity>;
  findByPlaceId(placeId: string): Promise<PlacePhotoEntity[]>;
  findById(id: string): Promise<PlacePhotoEntity | null>;
  delete(id: string): Promise<void>;
}

export const PHOTO_REPOSITORY = Symbol('IPhotoRepository');
