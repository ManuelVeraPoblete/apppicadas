export class PlacePhotoEntity {
  constructor(
    public readonly id: string,
    public placeId: string,
    public userId: string,
    public imageUrl: string,
    public publicId: string,
    public readonly createdAt: Date,
  ) {}
}
