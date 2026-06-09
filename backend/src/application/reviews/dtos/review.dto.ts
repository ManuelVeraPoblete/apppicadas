import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1, { message: 'El rating mínimo es 1' })
  @Max(5, { message: 'El rating máximo es 5' })
  rating: number;

  @ApiPropertyOptional({ example: 'Muy buen lugar, la atención fue excelente' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  foodQualityScore?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priceQualityScore?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  serviceScore?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  cleanlinessScore?: number;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  foodQualityScore?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priceQualityScore?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  serviceScore?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  cleanlinessScore?: number;
}

export class CreateReplyDto {
  @ApiProperty({ example: 'Muchas gracias por tu visita, te esperamos pronto!' })
  @IsString()
  @IsNotEmpty({ message: 'La respuesta no puede estar vacía' })
  @MaxLength(500)
  comment: string;
}

export class ReviewReplyResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() reviewId: string;
  @ApiProperty() ownerId: string;
  @ApiProperty() comment: string;
  @ApiProperty() createdAt: Date;
}

export class ReviewResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() placeId: string;
  @ApiProperty() userId: string;
  @ApiPropertyOptional() userName?: string;
  @ApiProperty() rating: number;
  @ApiPropertyOptional() comment?: string;
  @ApiPropertyOptional() foodQualityScore?: number;
  @ApiPropertyOptional() priceQualityScore?: number;
  @ApiPropertyOptional() serviceScore?: number;
  @ApiPropertyOptional() cleanlinessScore?: number;
  @ApiPropertyOptional({ type: ReviewReplyResponseDto }) reply?: ReviewReplyResponseDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedReviewsDto {
  @ApiProperty({ type: [ReviewResponseDto] }) data: ReviewResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
