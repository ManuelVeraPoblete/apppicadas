import { DayOfWeek } from '../enums/day-of-week.enum';

export class BusinessHourEntity {
  constructor(
    public readonly id: string,
    public placeId: string,
    public dayOfWeek: DayOfWeek,
    public isClosed: boolean,
    public openTime?: string,
    public closeTime?: string,
  ) {}
}
