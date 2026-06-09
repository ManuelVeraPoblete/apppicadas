export class CategoryEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public icon?: string,
  ) {}
}
