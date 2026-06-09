import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { DiscountType } from '../../../../core/domain/enums/discount-type.enum';
import { PlaceOrmEntity } from './place.orm-entity';

@Entity('offers')
@Index('IDX_offers_place_active_valid', ['placeId', 'isActive', 'validTo'])
export class OfferOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'place_id', type: 'varchar', length: 36 })
  placeId: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountValue: number | null;

  @Column({ name: 'valid_from', type: 'datetime' })
  validFrom: Date;

  @Column({ name: 'valid_to', type: 'datetime' })
  validTo: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'instagram_post_id', type: 'varchar', length: 100, nullable: true })
  instagramPostId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PlaceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id' })
  place: PlaceOrmEntity;
}
