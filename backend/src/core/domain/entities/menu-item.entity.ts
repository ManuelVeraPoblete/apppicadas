export class MenuItemEntity {
  constructor(
    public readonly id: string,
    public placeId: string,
    public name: string,
    public price: number,
    public isAvailable: boolean,
    public readonly createdAt: Date,
    public description?: string,
    public imageUrl?: string,
  ) {}
}
