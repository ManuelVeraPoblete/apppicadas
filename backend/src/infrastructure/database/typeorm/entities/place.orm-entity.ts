import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PriceRange } from '../../../../core/domain/enums/price-range.enum';
import { CategoryOrmEntity } from './category.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('places')
@Index('IDX_places_is_active', ['isActive'])
@Index('IDX_places_category_active', ['categoryId', 'isActive'])
@Index('IDX_places_price_active', ['priceRange', 'isActive'])
@Index('IDX_places_owner', ['createdById'])
export class PlaceOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'category_id', type: 'varchar', length: 36 })
  categoryId: string;

  @Column({ type: 'varchar', length: 300 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  // Columna espacial MySQL POINT para búsquedas por ST_Distance_Sphere
  @Index({ spatial: true })
  @Column({
    type: 'point',
    nullable: false,
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  instagram: string | null;

  @Column({
    name: 'price_range',
    type: 'enum',
    enum: PriceRange,
  })
  priceRange: PriceRange;

  @Column({
    name: 'rating_average',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  ratingAverage: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'menu_image_url', type: 'varchar', length: 500, nullable: true })
  menuImageUrl: string | null;

  @Column({ name: 'created_by_id', type: 'varchar', length: 36 })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CategoryOrmEntity, { eager: false })
  @JoinColumn({ name: 'category_id' })
  category: CategoryOrmEntity;

  @ManyToOne(() => UserOrmEntity, { eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: UserOrmEntity;
}
