import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../core/domain/enums/user-role.enum';

export class AuthUserDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ nullable: true }) avatarUrl: string | null;
  @ApiProperty() createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
  @ApiProperty({ type: AuthUserDto }) user: AuthUserDto;
}
