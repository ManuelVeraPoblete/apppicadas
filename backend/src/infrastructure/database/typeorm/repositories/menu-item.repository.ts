import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemEntity } from '../../../../core/domain/entities/menu-item.entity';
import { IMenuItemRepository } from '../../../../core/ports/repositories/menu-item.repository.port';
import { MenuItemOrmEntity } from '../entities/menu-item.orm-entity';

@Injectable()
export class MenuItemRepository implements IMenuItemRepository {
  constructor(
    @InjectRepository(MenuItemOrmEntity)
    private readonly repo: Repository<MenuItemOrmEntity>,
  ) {}

  private toDomain(orm: MenuItemOrmEntity): MenuItemEntity {
    return new MenuItemEntity(
      orm.id,
      orm.placeId,
      orm.name,
      orm.price,
      orm.isAvailable,
      orm.createdAt,
      orm.description ?? undefined,
      orm.imageUrl ?? undefined,
    );
  }

  async save(item: MenuItemEntity): Promise<MenuItemEntity> {
    const orm = new MenuItemOrmEntity();
    orm.id = item.id;
    orm.placeId = item.placeId;
    orm.name = item.name;
    orm.price = item.price;
    orm.isAvailable = item.isAvailable;
    orm.description = item.description ?? null;
    orm.imageUrl = item.imageUrl ?? null;
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async findByPlaceId(placeId: string): Promise<MenuItemEntity[]> {
    const orms = await this.repo.find({
      where: { placeId },
      order: { createdAt: 'ASC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findById(id: string): Promise<MenuItemEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async update(id: string, data: Partial<MenuItemEntity>): Promise<MenuItemEntity> {
    await this.repo.update(id, {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      isAvailable: data.isAvailable,
      imageUrl: data.imageUrl ?? null,
    });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
