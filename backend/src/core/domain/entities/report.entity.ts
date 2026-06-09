import { ReportStatus } from '../enums/report-status.enum';

export class ReportEntity {
  constructor(
    public readonly id: string,
    public userId: string,
    public placeId: string,
    public reason: string,
    public status: ReportStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public description?: string,
  ) {}
}
