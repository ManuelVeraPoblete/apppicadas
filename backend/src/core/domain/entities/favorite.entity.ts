export class FavoriteEntity {
  constructor(
    public readonly id: string,
    public userId: string,
    public placeId: string,
    public readonly createdAt: Date,
  ) {}
}
