import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '../../../core/domain/enums/day-of-week.enum';

export class BusinessHourItemDto {
  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MON })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'Formato de hora inválido (HH:mm)' })
  openTime?: string;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'Formato de hora inválido (HH:mm)' })
  closeTime?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isClosed: boolean;
}

export class SetBusinessHoursDto {
  @ApiProperty({ type: [BusinessHourItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHourItemDto)
  hours: BusinessHourItemDto[];
}

export class BusinessHourResponseDto {
  @ApiProperty({ enum: DayOfWeek }) dayOfWeek: DayOfWeek;
  @ApiPropertyOptional() openTime?: string;
  @ApiPropertyOptional() closeTime?: string;
  @ApiProperty() isClosed: boolean;
}
