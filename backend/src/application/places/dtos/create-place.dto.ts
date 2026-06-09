import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PriceRange } from '../../../core/domain/enums/price-range.enum';

export class CreatePlaceDto {
  @ApiProperty({ example: 'La Picada de Don Juan' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiPropertyOptional({ example: 'El mejor completo del barrio desde 1985' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'uuid-de-categoria' })
  @IsUUID('all', { message: 'categoryId debe ser un UUID válido' })
  categoryId: string;

  @ApiProperty({ example: 'Av. O\'Higgins 123, Concepción' })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  address: string;

  @ApiProperty({ example: 'Concepción' })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city: string;

  @ApiProperty({ example: -36.8261 })
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -73.0444 })
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: '+56912345678' })
  @IsOptional()
  @Matches(/^\+?[\d\s\-().]{7,20}$/, { message: 'phone debe ser un número telefónico válido' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://miweb.cl' })
  @IsOptional()
  @IsUrl({}, { message: 'website debe ser una URL válida' })
  website?: string;

  @ApiPropertyOptional({ example: '@lapicada' })
  @IsOptional()
  @Matches(/^@?[a-zA-Z0-9._]{1,30}$/, { message: 'instagram debe ser un handle válido (ej: @lapicada)' })
  instagram?: string;

  @ApiProperty({ enum: PriceRange, example: PriceRange.LOW })
  @IsEnum(PriceRange, { message: 'priceRange debe ser LOW, MEDIUM o HIGH' })
  priceRange: PriceRange;
}
