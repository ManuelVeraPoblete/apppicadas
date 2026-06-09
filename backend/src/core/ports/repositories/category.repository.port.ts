import { CategoryEntity } from '../../domain/entities/category.entity';

export interface ICategoryRepository {
  findAll(): Promise<CategoryEntity[]>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  save(category: CategoryEntity): Promise<CategoryEntity>;
  update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity>;
  softDelete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository');
