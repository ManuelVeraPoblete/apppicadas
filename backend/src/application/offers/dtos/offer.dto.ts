import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { DiscountType } from '../../../core/domain/enums/discount-type.enum';

export class CreateOfferDto {
  @ApiProperty({ example: '2x1 en completos' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Válido de lunes a jueves' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../oferta.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiPropertyOptional({ example: 20, description: 'Requerido solo para PERCENTAGE y FIXED' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  discountValue?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2026-06-30T23:59:59Z' })
  @IsDateString()
  validTo: string;
}

export class UpdateOfferDto {
  @ApiPropertyOptional() @IsOptional() @IsString()  title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  description?: string;
  @ApiPropertyOptional({ enum: DiscountType }) @IsOptional() @IsEnum(DiscountType) discountType?: DiscountType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() discountValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() validFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() validTo?: string;
}

export class OfferResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() placeId: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() imageUrl?: string;
  @ApiProperty({ enum: DiscountType }) discountType: DiscountType;
  @ApiPropertyOptional() discountValue?: number;
  @ApiProperty() validFrom: Date;
  @ApiProperty() validTo: Date;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiPropertyOptional() instagramPostId?: string;
}
