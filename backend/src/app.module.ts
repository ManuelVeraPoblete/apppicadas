import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { typeOrmConfig } from './infrastructure/database/typeorm/config/typeorm.config';
import { AuthModule } from './presentation/auth/auth.module';
import { PlacesModule } from './presentation/places/places.module';
import { CategoriesModule } from './presentation/categories/categories.module';
import { ReviewsModule } from './presentation/reviews/reviews.module';
import { FavoritesModule } from './presentation/favorites/favorites.module';
import { ReportsModule } from './presentation/reports/reports.module';
import { OwnerModule } from './presentation/owner/owner.module';
import { InstagramModule } from './presentation/instagram/instagram.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    // Rate limiting global: 60 req/min por IP — los endpoints de auth lo sobreescriben
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    AuthModule,
    PlacesModule,
    CategoriesModule,
    ReviewsModule,
    FavoritesModule,
    ReportsModule,
    OwnerModule,
    InstagramModule,
  ],
  providers: [
    // Aplica ThrottlerGuard globalmente a todos los endpoints
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
