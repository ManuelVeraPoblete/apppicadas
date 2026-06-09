export class ReviewEntity {
  constructor(
    public readonly id: string,
    public placeId: string,
    public userId: string,
    public rating: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public comment?: string,
    public foodQualityScore?: number,
    public priceQualityScore?: number,
    public serviceScore?: number,
    public cleanlinessScore?: number,
    public userName?: string,
  ) {}
}
