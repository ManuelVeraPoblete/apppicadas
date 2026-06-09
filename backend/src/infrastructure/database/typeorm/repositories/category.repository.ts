import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../../../core/domain/entities/category.entity';
import { ICategoryRepository } from '../../../../core/ports/repositories/category.repository.port';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { CategoryMapper } from '../../mappers/category.mapper';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async findAll(): Promise<CategoryEntity[]> {
    const orms = await this.repo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return orms.map(CategoryMapper.toDomain);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? CategoryMapper.toDomain(orm) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const orm = await this.repo.findOne({ where: { slug } });
    return orm ? CategoryMapper.toDomain(orm) : null;
  }

  async save(category: CategoryEntity): Promise<CategoryEntity> {
    const orm = CategoryMapper.toOrm(category);
    const saved = await this.repo.save(orm);
    return CategoryMapper.toDomain(saved);
  }

  async update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    await this.repo.update(id, {
      name: data.name,
      slug: data.slug,
      icon: data.icon ?? null,
      isActive: data.isActive,
    });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return CategoryMapper.toDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(id, { isActive: false });
  }
}
