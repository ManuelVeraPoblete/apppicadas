import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesController } from './favorites.controller';
import { ToggleFavoriteUseCase } from '../../application/favorites/use-cases/toggle-favorite.use-case';
import { GetUserFavoritesUseCase } from '../../application/favorites/use-cases/get-user-favorites.use-case';
import { FavoriteRepository } from '../../infrastructure/database/typeorm/repositories/favorite.repository';
import { PlaceRepository } from '../../infrastructure/database/typeorm/repositories/place.repository';
import { FavoriteOrmEntity } from '../../infrastructure/database/typeorm/entities/favorite.orm-entity';
import { PlaceOrmEntity } from '../../infrastructure/database/typeorm/entities/place.orm-entity';
import { FAVORITE_REPOSITORY } from '../../core/ports/repositories/favorite.repository.port';
import { PLACE_REPOSITORY } from '../../core/ports/repositories/place.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteOrmEntity, PlaceOrmEntity])],
  controllers: [FavoritesController],
  providers: [
    ToggleFavoriteUseCase,
    GetUserFavoritesUseCase,
    { provide: FAVORITE_REPOSITORY, useClass: FavoriteRepository },
    { provide: PLACE_REPOSITORY, useClass: PlaceRepository },
  ],
})
export class FavoritesModule {}
