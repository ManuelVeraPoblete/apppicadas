import { MenuItemEntity } from '../../domain/entities/menu-item.entity';

export interface IMenuItemRepository {
  save(item: MenuItemEntity): Promise<MenuItemEntity>;
  findByPlaceId(placeId: string): Promise<MenuItemEntity[]>;
  findById(id: string): Promise<MenuItemEntity | null>;
  update(id: string, data: Partial<MenuItemEntity>): Promise<MenuItemEntity>;
  delete(id: string): Promise<void>;
}

export const MENU_ITEM_REPOSITORY = Symbol('IMenuItemRepository');
