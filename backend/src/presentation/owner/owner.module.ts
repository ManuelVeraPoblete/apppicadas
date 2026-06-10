import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerController } from './owner.controller';
import { PlaceOrmEntity } from '../../infrastructure/database/typeorm/entities/place.orm-entity';
import { PlacePhotoOrmEntity } from '../../infrastructure/database/typeorm/entities/place-photo.orm-entity';
import { MenuItemOrmEntity } from '../../infrastructure/database/typeorm/entities/menu-item.orm-entity';
import { BusinessHourOrmEntity } from '../../infrastructure/database/typeorm/entities/business-hour.orm-entity';
import { OfferOrmEntity } from '../../infrastructure/database/typeorm/entities/offer.orm-entity';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { InstagramModule } from '../instagram/instagram.module';
import { PlacesModule } from '../places/places.module';
import { PublishOfferToInstagramUseCase } from '../../application/instagram/use-cases/publish-offer-to-instagram.use-case';
import { OfferRepository } from '../../infrastructure/database/typeorm/repositories/offer.repository';
import { OFFER_REPOSITORY } from '../../core/ports/repositories/offer.repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlaceOrmEntity,
      PlacePhotoOrmEntity,
      MenuItemOrmEntity,
      BusinessHourOrmEntity,
      OfferOrmEntity,
    ]),
    StorageModule,
    InstagramModule,
    PlacesModule,
  ],
  controllers: [OwnerController],
  providers: [
    { provide: OFFER_REPOSITORY, useClass: OfferRepository },
    PublishOfferToInstagramUseCase,
  ],
})
export class OwnerModule {}
