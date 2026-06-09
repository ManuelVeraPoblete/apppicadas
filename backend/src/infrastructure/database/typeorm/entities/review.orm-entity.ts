import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PlaceOrmEntity } from './place.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('reviews')
@Unique(['userId', 'placeId'])
@Index('IDX_reviews_place_id', ['placeId'])
@Index('IDX_reviews_user_id', ['userId'])
export class ReviewOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'place_id', type: 'varchar', length: 36 })
  placeId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'tinyint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ name: 'food_quality_score', type: 'tinyint', nullable: true })
  foodQualityScore: number | null;

  @Column({ name: 'price_quality_score', type: 'tinyint', nullable: true })
  priceQualityScore: number | null;

  @Column({ name: 'service_score', type: 'tinyint', nullable: true })
  serviceScore: number | null;

  @Column({ name: 'cleanliness_score', type: 'tinyint', nullable: true })
  cleanlinessScore: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => PlaceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id' })
  place: PlaceOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;
}
