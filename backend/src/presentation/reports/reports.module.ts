import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportOrmEntity } from '../../infrastructure/database/typeorm/entities/report.orm-entity';
import { PlaceOrmEntity } from '../../infrastructure/database/typeorm/entities/place.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportOrmEntity, PlaceOrmEntity])],
  controllers: [ReportsController],
})
export class ReportsModule {}
