import { BusinessHourEntity } from '../../domain/entities/business-hour.entity';

export interface IBusinessHourRepository {
  saveMany(hours: BusinessHourEntity[]): Promise<BusinessHourEntity[]>;
  findByPlaceId(placeId: string): Promise<BusinessHourEntity[]>;
  deleteByPlaceId(placeId: string): Promise<void>;
}

export const BUSINESS_HOUR_REPOSITORY = Symbol('IBusinessHourRepository');
