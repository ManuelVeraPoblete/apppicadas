import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PriceRange } from '../../../core/domain/enums/price-range.enum';

export class PlaceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() categoryId: string;
  @ApiProperty() address: string;
  @ApiProperty() city: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiPropertyOptional() phone?: string;
  @ApiPropertyOptional() website?: string;
  @ApiPropertyOptional() instagram?: string;
  @ApiProperty({ enum: PriceRange }) priceRange: PriceRange;
  @ApiProperty() ratingAverage: number;
  @ApiProperty() reviewCount: number;
  @ApiProperty() isVerified: boolean;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiPropertyOptional() menuImageUrl?: string;
}

export class NearbyPlaceResponseDto extends PlaceResponseDto {
  @ApiProperty({ description: 'Distancia al usuario en metros' })
  distanceMeters: number;
}
