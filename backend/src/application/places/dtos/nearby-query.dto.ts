import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PriceRange } from '../../../core/domain/enums/price-range.enum';

export class NearbyQueryDto {
  @ApiProperty({ example: -36.8261, description: 'Latitud del usuario' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: -73.0444, description: 'Longitud del usuario' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiPropertyOptional({ example: 3000, description: 'Radio en metros (default: 3000, máx: 50000)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(50000)
  radius?: number;

  @ApiPropertyOptional({ description: 'Filtrar por categoría (UUID)' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ enum: PriceRange, description: 'Filtrar por rango de precio' })
  @IsOptional()
  @IsEnum(PriceRange)
  priceRange?: PriceRange;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
