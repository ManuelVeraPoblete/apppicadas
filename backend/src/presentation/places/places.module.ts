import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesController } from './places.controller';
import { CreatePlaceUseCase } from '../../application/places/use-cases/create-place.use-case';
import { GetNearbyPlacesUseCase } from '../../application/places/use-cases/get-nearby-places.use-case';
import { GetPlaceDetailUseCase } from '../../application/places/use-cases/get-place-detail.use-case';
import { UpdatePlaceUseCase } from '../../application/places/use-cases/update-place.use-case';
import { DeletePlaceUseCase } from '../../application/places/use-cases/delete-place.use-case';
import { GetOwnerPlaceUseCase } from '../../application/places/use-cases/get-owner-place.use-case';
import { PlaceRepository } from '../../infrastructure/database/typeorm/repositories/place.repository';
import { PlaceOrmEntity } from '../../infrastructure/database/typeorm/entities/place.orm-entity';
import { MenuItemOrmEntity } from '../../infrastructure/database/typeorm/entities/menu-item.orm-entity';
import { BusinessHourOrmEntity } from '../../infrastructure/database/typeorm/entities/business-hour.orm-entity';
import { OfferOrmEntity } from '../../infrastructure/database/typeorm/entities/offer.orm-entity';
import { PLACE_REPOSITORY } from '../../core/ports/repositories/place.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceOrmEntity, MenuItemOrmEntity, BusinessHourOrmEntity, OfferOrmEntity])],
  controllers: [PlacesController],
  providers: [
    CreatePlaceUseCase,
    GetNearbyPlacesUseCase,
    GetPlaceDetailUseCase,
    UpdatePlaceUseCase,
    DeletePlaceUseCase,
    GetOwnerPlaceUseCase,
    { provide: PLACE_REPOSITORY, useClass: PlaceRepository },
  ],
  exports: [{ provide: PLACE_REPOSITORY, useClass: PlaceRepository }],
})
export class PlacesModule {}
