import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { PlaceOrmEntity } from '../entities/place.orm-entity';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { ReviewOrmEntity } from '../entities/review.orm-entity';
import { ReviewReplyOrmEntity } from '../entities/review-reply.orm-entity';
import { PlacePhotoOrmEntity } from '../entities/place-photo.orm-entity';
import { FavoriteOrmEntity } from '../entities/favorite.orm-entity';
import { ReportOrmEntity } from '../entities/report.orm-entity';
import { MenuItemOrmEntity } from '../entities/menu-item.orm-entity';
import { BusinessHourOrmEntity } from '../entities/business-hour.orm-entity';
import { OfferOrmEntity } from '../entities/offer.orm-entity';
import { RevokedTokenOrmEntity } from '../entities/revoked-token.orm-entity';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.get<string>('DB_HOST', '127.0.0.1'),
  port: config.get<number>('DB_PORT', 3306),
  username: config.get<string>('DB_USERNAME', 'root'),
  password: config.get<string>('DB_PASSWORD', ''),
  database: config.get<string>('DB_NAME', 'picacerca_db'),
  entities: [
    UserOrmEntity,
    PlaceOrmEntity,
    CategoryOrmEntity,
    ReviewOrmEntity,
    ReviewReplyOrmEntity,
    PlacePhotoOrmEntity,
    FavoriteOrmEntity,
    ReportOrmEntity,
    MenuItemOrmEntity,
    BusinessHourOrmEntity,
    OfferOrmEntity,
    RevokedTokenOrmEntity,
  ],
  migrations: [__dirname + '/../migrations/*.ts'],
  // synchronize solo en desarrollo — en producción usar migraciones
  synchronize: config.get<string>('NODE_ENV') === 'development',
  logging: config.get<string>('NODE_ENV') === 'development',
  charset: 'utf8mb4',
});
