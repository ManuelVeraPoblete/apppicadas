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
import { PublishOfferToInstagramUseCase } from '../../application/instagram/use-cases/publish-offer-to-instagram.use-case';

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
  ],
  controllers: [OwnerController],
  providers: [PublishOfferToInstagramUseCase],
})
export class OwnerModule {}
