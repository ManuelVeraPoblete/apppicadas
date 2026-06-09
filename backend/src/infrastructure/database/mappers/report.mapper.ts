import { ReportEntity } from '../../../core/domain/entities/report.entity';
import { ReportOrmEntity } from '../typeorm/entities/report.orm-entity';

export class ReportMapper {
  static toDomain(orm: ReportOrmEntity): ReportEntity {
    return new ReportEntity(
      orm.id,
      orm.userId,
      orm.placeId,
      orm.reason,
      orm.status,
      orm.createdAt,
      orm.updatedAt,
      orm.description ?? undefined,
    );
  }

  static toOrm(domain: ReportEntity): ReportOrmEntity {
    const orm = new ReportOrmEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.placeId = domain.placeId;
    orm.reason = domain.reason;
    orm.status = domain.status;
    orm.description = domain.description ?? null;
    return orm;
  }
}
