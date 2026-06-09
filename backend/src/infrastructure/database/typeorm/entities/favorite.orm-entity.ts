import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { PlaceOrmEntity } from './place.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('favorites')
@Unique(['userId', 'placeId'])
@Index('IDX_favorites_user_id', ['userId'])
export class FavoriteOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'place_id', type: 'varchar', length: 36 })
  placeId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => PlaceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id' })
  place: PlaceOrmEntity;
}
