import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from '../../../../core/domain/entities/report.entity';
import { IReportRepository } from '../../../../core/ports/repositories/report.repository.port';
import { ReportStatus } from '../../../../core/domain/enums/report-status.enum';
import { ReportOrmEntity } from '../entities/report.orm-entity';
import { ReportMapper } from '../../mappers/report.mapper';

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(
    @InjectRepository(ReportOrmEntity)
    private readonly repo: Repository<ReportOrmEntity>,
  ) {}

  async save(report: ReportEntity): Promise<ReportEntity> {
    const orm = ReportMapper.toOrm(report);
    const saved = await this.repo.save(orm);
    return ReportMapper.toDomain(saved);
  }

  async findAll(
    page: number,
    limit: number,
    status?: ReportStatus,
  ): Promise<{ reports: ReportEntity[]; total: number }> {
    const where = status ? { status } : {};
    const [orms, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { reports: orms.map(ReportMapper.toDomain), total };
  }

  async findById(id: string): Promise<ReportEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? ReportMapper.toDomain(orm) : null;
  }

  async updateStatus(id: string, status: ReportStatus): Promise<ReportEntity> {
    await this.repo.update(id, { status });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return ReportMapper.toDomain(updated);
  }
}
