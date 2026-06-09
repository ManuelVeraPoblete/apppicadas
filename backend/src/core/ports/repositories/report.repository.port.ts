import { ReportEntity } from '../../domain/entities/report.entity';
import { ReportStatus } from '../../domain/enums/report-status.enum';

export interface IReportRepository {
  save(report: ReportEntity): Promise<ReportEntity>;
  findAll(page: number, limit: number, status?: ReportStatus): Promise<{ reports: ReportEntity[]; total: number }>;
  findById(id: string): Promise<ReportEntity | null>;
  updateStatus(id: string, status: ReportStatus): Promise<ReportEntity>;
}

export const REPORT_REPOSITORY = Symbol('IReportRepository');
