import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReportStatus } from '../../../core/domain/enums/report-status.enum';

export class CreateReportDto {
  @ApiProperty({ example: 'Información incorrecta' })
  @IsString()
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  reason: string;

  @ApiPropertyOptional({ example: 'El horario indicado no coincide con el real' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus, { message: 'Estado inválido' })
  status: ReportStatus;
}

export class ReportResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() placeId: string;
  @ApiProperty() reason: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty({ enum: ReportStatus }) status: ReportStatus;
  @ApiProperty() createdAt: Date;
}

export class PaginatedReportsDto {
  @ApiProperty({ type: [ReportResponseDto] }) data: ReportResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
