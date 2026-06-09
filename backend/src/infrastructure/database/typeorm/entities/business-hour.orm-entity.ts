import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { DayOfWeek } from '../../../../core/domain/enums/day-of-week.enum';
import { PlaceOrmEntity } from './place.orm-entity';

@Entity('business_hours')
@Unique(['placeId', 'dayOfWeek'])
export class BusinessHourOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'place_id', type: 'varchar', length: 36 })
  placeId: string;

  @Column({
    name: 'day_of_week',
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;

  @Column({ name: 'open_time', type: 'time', nullable: true })
  openTime: string | null;

  @Column({ name: 'close_time', type: 'time', nullable: true })
  closeTime: string | null;

  @Column({ name: 'is_closed', type: 'boolean', default: false })
  isClosed: boolean;

  @ManyToOne(() => PlaceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'place_id' })
  place: PlaceOrmEntity;
}
