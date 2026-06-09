import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Completo italiano' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Con palta, tomate y mayo' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @IsPositive()
  price: number;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() price?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAvailable?: boolean;
}

export class MenuItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() placeId: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() price: number;
  @ApiPropertyOptional() imageUrl?: string;
  @ApiProperty() isAvailable: boolean;
  @ApiProperty() createdAt: Date;
}
