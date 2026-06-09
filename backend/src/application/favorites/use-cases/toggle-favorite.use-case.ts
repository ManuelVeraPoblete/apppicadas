import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IFavoriteRepository,
  FAVORITE_REPOSITORY,
} from '../../../core/ports/repositories/favorite.repository.port';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { FavoriteEntity } from '../../../core/domain/entities/favorite.entity';
import { PlaceNotFoundException } from '../../../core/domain/exceptions/domain.exceptions';

@Injectable()
export class ToggleFavoriteUseCase {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favoriteRepository: IFavoriteRepository,
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async add(userId: string, placeId: string): Promise<FavoriteEntity> {
    const place = await this.placeRepository.findById(placeId);
    if (!place) throw new PlaceNotFoundException(placeId);

    // Si ya existe, simplemente lo retornamos (idempotente)
    const alreadyExists = await this.favoriteRepository.exists(userId, placeId);
    if (alreadyExists) {
      const list = await this.favoriteRepository.findByUserId(userId);
      return list.find((f) => f.placeId === placeId)!;
    }

    const favorite = new FavoriteEntity(uuidv4(), userId, placeId, new Date());
    return this.favoriteRepository.save(favorite);
  }

  async remove(userId: string, placeId: string): Promise<void> {
    await this.favoriteRepository.delete(userId, placeId);
  }
}
