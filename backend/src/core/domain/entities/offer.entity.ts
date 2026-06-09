import { DiscountType } from '../enums/discount-type.enum';

export class OfferEntity {
  constructor(
    public readonly id: string,
    public placeId: string,
    public title: string,
    public discountType: DiscountType,
    public discountValue: number,
    public validFrom: Date,
    public validTo: Date,
    public isActive: boolean,
    public readonly createdAt: Date,
    public description?: string,
    public imageUrl?: string,
    public instagramPostId?: string,
  ) {}
}
