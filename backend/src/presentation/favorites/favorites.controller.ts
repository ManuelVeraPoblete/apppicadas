import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ToggleFavoriteUseCase } from '../../application/favorites/use-cases/toggle-favorite.use-case';
import { GetUserFavoritesUseCase } from '../../application/favorites/use-cases/get-user-favorites.use-case';
import { PlaceResponseDto } from '../../application/places/dtos/place-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../shared/decorators/current-user.decorator';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/domain/enums/user-role.enum';

@ApiTags('Favorites')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@ApiBearerAuth('JWT')
export class FavoritesController {
  constructor(
    private readonly toggleFavoriteUseCase: ToggleFavoriteUseCase,
    private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
  ) {}

  @Get('users/me/favorites')
  @ApiOperation({ summary: 'Listar todos mis favoritos (Tab 1 del USER)' })
  @ApiResponse({ status: 200, type: [PlaceResponseDto] })
  async getMyFavorites(@CurrentUser() user: JwtPayload) {
    const places = await this.getUserFavoritesUseCase.execute(user.sub);
    return places.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      address: p.address,
      city: p.city,
      latitude: p.latitude,
      longitude: p.longitude,
      phone: p.phone,
      priceRange: p.priceRange,
      ratingAverage: p.ratingAverage,
      reviewCount: p.reviewCount,
      isVerified: p.isVerified,
      createdAt: p.createdAt,
    }));
  }

  @Post('places/:placeId/favorite')
  @ApiOperation({ summary: 'Agregar local a favoritos' })
  async addFavorite(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const favorite = await this.toggleFavoriteUseCase.add(user.sub, placeId);
    return { message: 'Agregado a favoritos', favoriteId: favorite.id };
  }

  @Delete('places/:placeId/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quitar local de favoritos' })
  async removeFavorite(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.toggleFavoriteUseCase.remove(user.sub, placeId);
  }
}
