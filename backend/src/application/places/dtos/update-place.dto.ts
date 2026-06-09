import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePlaceDto } from './create-place.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
