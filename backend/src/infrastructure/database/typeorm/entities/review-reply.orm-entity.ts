import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ReviewOrmEntity } from './review.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('review_replies')
export class ReviewReplyOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'review_id', type: 'varchar', length: 36, unique: true })
  reviewId: string;

  @Column({ name: 'owner_id', type: 'varchar', length: 36 })
  ownerId: string;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => ReviewOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: ReviewOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'owner_id' })
  owner: UserOrmEntity;
}
