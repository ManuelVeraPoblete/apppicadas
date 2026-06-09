import { PriceRange } from '../enums/price-range.enum';

export class PlaceEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public categoryId: string,
    public address: string,
    public city: string,
    public latitude: number,
    public longitude: number,
    public priceRange: PriceRange,
    public createdById: string,
    public isActive: boolean,
    public isVerified: boolean,
    public ratingAverage: number,
    public reviewCount: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public description?: string,
    public phone?: string,
    public website?: string,
    public instagram?: string,
    public menuImageUrl?: string,
  ) {}
}
