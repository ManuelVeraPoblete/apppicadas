import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ReportOrmEntity } from '../../infrastructure/database/typeorm/entities/report.orm-entity';
import { PlaceOrmEntity } from '../../infrastructure/database/typeorm/entities/place.orm-entity';
import { ReportMapper } from '../../infrastructure/database/mappers/report.mapper';
import { ReportEntity } from '../../core/domain/entities/report.entity';
import { ReportStatus } from '../../core/domain/enums/report-status.enum';
import { UserRole } from '../../core/domain/enums/user-role.enum';
import {
  CreateReportDto,
  ReportResponseDto,
  UpdateReportStatusDto,
} from '../../application/reports/dtos/report.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../shared/decorators/current-user.decorator';
import { Roles } from '../shared/decorators/roles.decorator';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Reports')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ReportsController {
  constructor(
    @InjectRepository(ReportOrmEntity)
    private readonly reportRepo: Repository<ReportOrmEntity>,
    @InjectRepository(PlaceOrmEntity)
    private readonly placeRepo: Repository<PlaceOrmEntity>,
  ) {}

  // ─── USER reporta un local ───────────────────────────────────────────────────

  @Post('places/:placeId/reports')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Reportar información incorrecta de un local (USER)' })
  @ApiResponse({ status: 201, type: ReportResponseDto })
  async createReport(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() dto: CreateReportDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReportResponseDto> {
    const place = await this.placeRepo.findOne({ where: { id: placeId } });
    if (!place) throw new NotFoundException('Local no encontrado');

    const entity = new ReportEntity(
      uuidv4(),
      user.sub,
      placeId,
      dto.reason,
      ReportStatus.PENDING,
      new Date(),
      new Date(),
      dto.description,
    );
    const orm = ReportMapper.toOrm(entity);
    const saved = await this.reportRepo.save(orm);
    return this.toResponse(ReportMapper.toDomain(saved));
  }

  // ─── ADMIN modera reportes ───────────────────────────────────────────────────

  @Get('admin/reports')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Listar reportes (ADMIN/MODERATOR)' })
  @ApiQuery({ name: 'status', enum: ReportStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async findAll(
    @Query('status') status?: ReportStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const where = status ? { status } : {};
    const [orms, total] = await this.reportRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    return {
      data: orms.map((o) => this.toResponse(ReportMapper.toDomain(o))),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  @Patch('admin/reports/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Cambiar estado de un reporte (ADMIN/MODERATOR)' })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportStatusDto,
  ): Promise<ReportResponseDto> {
    const existing = await this.reportRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Reporte no encontrado');
    await this.reportRepo.update(id, { status: dto.status });
    const updated = await this.reportRepo.findOneOrFail({ where: { id } });
    return this.toResponse(ReportMapper.toDomain(updated));
  }

  private toResponse(entity: ReportEntity): ReportResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      placeId: entity.placeId,
      reason: entity.reason,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
