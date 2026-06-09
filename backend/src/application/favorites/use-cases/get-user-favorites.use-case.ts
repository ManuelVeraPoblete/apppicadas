import { Inject, Injectable } from '@nestjs/common';
import {
  IFavoriteRepository,
  FAVORITE_REPOSITORY,
} from '../../../core/ports/repositories/favorite.repository.port';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../../core/ports/repositories/place.repository.port';
import { PlaceEntity } from '../../../core/domain/entities/place.entity';

@Injectable()
export class GetUserFavoritesUseCase {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favoriteRepository: IFavoriteRepository,
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  async execute(userId: string): Promise<PlaceEntity[]> {
    const favorites = await this.favoriteRepository.findByUserId(userId);

    // Cargamos los datos completos de cada local favorito en paralelo
    const places = await Promise.all(
      favorites.map((f) => this.placeRepository.findById(f.placeId)),
    );

    // Filtramos nulos (locales desactivados)
    return places.filter((p): p is PlaceEntity => p !== null);
  }
}
