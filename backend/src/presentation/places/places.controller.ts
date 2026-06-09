import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { MenuItemOrmEntity } from '../../infrastructure/database/typeorm/entities/menu-item.orm-entity';
import { BusinessHourOrmEntity } from '../../infrastructure/database/typeorm/entities/business-hour.orm-entity';
import { OfferOrmEntity } from '../../infrastructure/database/typeorm/entities/offer.orm-entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePlaceUseCase } from '../../application/places/use-cases/create-place.use-case';
import { GetNearbyPlacesUseCase } from '../../application/places/use-cases/get-nearby-places.use-case';
import { GetPlaceDetailUseCase } from '../../application/places/use-cases/get-place-detail.use-case';
import { UpdatePlaceUseCase } from '../../application/places/use-cases/update-place.use-case';
import { DeletePlaceUseCase } from '../../application/places/use-cases/delete-place.use-case';
import { GetOwnerPlaceUseCase } from '../../application/places/use-cases/get-owner-place.use-case';
import { CreatePlaceDto } from '../../application/places/dtos/create-place.dto';
import { UpdatePlaceDto } from '../../application/places/dtos/update-place.dto';
import { NearbyQueryDto } from '../../application/places/dtos/nearby-query.dto';
import { NearbyPlaceResponseDto, PlaceResponseDto } from '../../application/places/dtos/place-response.dto';
import { MenuItemResponseDto } from '../../application/menu/dtos/menu.dto';
import { BusinessHourResponseDto } from '../../application/business-hours/dtos/business-hour.dto';
import { OfferResponseDto } from '../../application/offers/dtos/offer.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../shared/decorators/current-user.decorator';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/domain/enums/user-role.enum';
import { PlaceEntity } from '../../core/domain/entities/place.entity';
import {
  IPlaceRepository,
  PLACE_REPOSITORY,
} from '../../core/ports/repositories/place.repository.port';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(
    private readonly createPlaceUseCase: CreatePlaceUseCase,
    private readonly getNearbyPlacesUseCase: GetNearbyPlacesUseCase,
    private readonly getPlaceDetailUseCase: GetPlaceDetailUseCase,
    private readonly updatePlaceUseCase: UpdatePlaceUseCase,
    private readonly deletePlaceUseCase: DeletePlaceUseCase,
    private readonly getOwnerPlaceUseCase: GetOwnerPlaceUseCase,
    @InjectRepository(MenuItemOrmEntity)
    private readonly menuRepo: Repository<MenuItemOrmEntity>,
    @InjectRepository(BusinessHourOrmEntity)
    private readonly hoursRepo: Repository<BusinessHourOrmEntity>,
    @InjectRepository(OfferOrmEntity)
    private readonly offerRepo: Repository<OfferOrmEntity>,
    @Inject(PLACE_REPOSITORY)
    private readonly placeRepository: IPlaceRepository,
  ) {}

  // ─── Admin endpoints ─────────────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Listar todos los locales (ADMIN/MODERATOR)' })
  @ApiResponse({ status: 200, type: [PlaceResponseDto] })
  async adminFindAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<{ data: PlaceResponseDto[]; total: number }> {
    const { places, total } = await this.placeRepository.findAll(Number(page), Number(limit));
    return { data: places.map((p) => this.toResponse(p)), total };
  }

  @Patch('admin/:id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Verificar un local (solo ADMIN)' })
  @ApiResponse({ status: 200, type: PlaceResponseDto })
  async verifyPlace(@Param('id', ParseUUIDPipe) id: string): Promise<PlaceResponseDto> {
    const place = await this.placeRepository.findById(id);
    if (!place) throw new NotFoundException('Local no encontrado');
    await this.placeRepository.verifyPlace(id);
    const verified = await this.placeRepository.findById(id);
    return this.toResponse(verified!);
  }

  // ─── Búsqueda pública ────────────────────────────────────────────────────────

  @Get('nearby')
  @ApiOperation({ summary: 'Buscar picadas cercanas por geolocalización' })
  @ApiResponse({ status: 200, type: [NearbyPlaceResponseDto] })
  async findNearby(@Query() query: NearbyQueryDto) {
    const results = await this.getNearbyPlacesUseCase.execute(query);
    return results.map(({ place, distanceMeters }) => ({
      ...this.toResponse(place),
      distanceMeters: Math.round(distanceMeters),
    }));
  }

  @Get('my-place')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obtener el local del OWNER autenticado' })
  @ApiResponse({ status: 200, type: PlaceResponseDto })
  async getMyPlace(@CurrentUser() user: JwtPayload) {
    const place = await this.getOwnerPlaceUseCase.execute(user.sub);
    if (!place) return null;
    return this.toResponse(place);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Crear nuevo local (solo OWNER)' })
  @ApiResponse({ status: 201, type: PlaceResponseDto })
  async create(
    @Body() dto: CreatePlaceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const place = await this.createPlaceUseCase.execute(dto, user);
    return this.toResponse(place);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de un local' })
  @ApiResponse({ status: 200, type: PlaceResponseDto })
  @ApiResponse({ status: 404, description: 'Local no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const place = await this.getPlaceDetailUseCase.execute(id);
    return this.toResponse(place);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Editar un local (OWNER dueño o ADMIN)' })
  @ApiResponse({ status: 200, type: PlaceResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlaceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const place = await this.updatePlaceUseCase.execute(id, dto, user);
    return this.toResponse(place);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Eliminar (desactivar) un local' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.deletePlaceUseCase.execute(id, user);
  }

  // ─── Lectura pública: menú, horarios, ofertas de cualquier local ────────────

  @Get(':id/menu')
  @ApiOperation({ summary: 'Ver menú de un local (público)' })
  @ApiResponse({ status: 200, type: [MenuItemResponseDto] })
  async getMenu(@Param('id', ParseUUIDPipe) id: string): Promise<MenuItemResponseDto[]> {
    const items = await this.menuRepo.find({ where: { placeId: id }, order: { createdAt: 'ASC' } });
    return items.map((item) => ({
      id: item.id,
      placeId: item.placeId,
      name: item.name,
      description: item.description ?? undefined,
      price: Number(item.price),
      imageUrl: item.imageUrl ?? undefined,
      isAvailable: item.isAvailable,
      createdAt: item.createdAt,
    }));
  }

  @Get(':id/hours')
  @ApiOperation({ summary: 'Ver horarios de un local (público)' })
  @ApiResponse({ status: 200, type: [BusinessHourResponseDto] })
  async getHours(@Param('id', ParseUUIDPipe) id: string): Promise<BusinessHourResponseDto[]> {
    const hours = await this.hoursRepo.find({ where: { placeId: id }, order: { dayOfWeek: 'ASC' } });
    return hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime ?? undefined,
      closeTime: h.closeTime ?? undefined,
      isClosed: h.isClosed,
    }));
  }

  @Get(':id/offers')
  @ApiOperation({ summary: 'Ver ofertas activas de un local (público)' })
  @ApiResponse({ status: 200, type: [OfferResponseDto] })
  async getOffers(@Param('id', ParseUUIDPipe) id: string): Promise<OfferResponseDto[]> {
    const now = new Date();
    const offers = await this.offerRepo.find({
      where: { placeId: id, isActive: true, validTo: MoreThanOrEqual(now) },
    });
    return offers.map((o) => ({
        id: o.id,
        placeId: o.placeId,
        title: o.title,
        description: o.description ?? undefined,
        imageUrl: o.imageUrl ?? undefined,
        discountType: o.discountType,
        discountValue: o.discountValue != null ? Number(o.discountValue) : undefined,
        validFrom: o.validFrom,
        validTo: o.validTo,
        isActive: o.isActive,
        createdAt: o.createdAt,
        instagramPostId: o.instagramPostId ?? undefined,
      }));
  }

  private toResponse(place: PlaceEntity): PlaceResponseDto {
    return {
      id: place.id,
      name: place.name,
      description: place.description,
      categoryId: place.categoryId,
      address: place.address,
      city: place.city,
      latitude: place.latitude,
      longitude: place.longitude,
      phone: place.phone,
      website: place.website,
      instagram: place.instagram,
      priceRange: place.priceRange,
      ratingAverage: place.ratingAverage,
      reviewCount: place.reviewCount,
      isVerified: place.isVerified,
      isActive: place.isActive,
      createdAt: place.createdAt,
      menuImageUrl: place.menuImageUrl ?? undefined,
    };
  }
}
