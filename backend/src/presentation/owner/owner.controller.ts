import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { PlaceOrmEntity } from '../../infrastructure/database/typeorm/entities/place.orm-entity';
import { PlacePhotoOrmEntity } from '../../infrastructure/database/typeorm/entities/place-photo.orm-entity';
import { MenuItemOrmEntity } from '../../infrastructure/database/typeorm/entities/menu-item.orm-entity';
import { BusinessHourOrmEntity } from '../../infrastructure/database/typeorm/entities/business-hour.orm-entity';
import { OfferOrmEntity } from '../../infrastructure/database/typeorm/entities/offer.orm-entity';

import { UserRole } from '../../core/domain/enums/user-role.enum';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../shared/decorators/current-user.decorator';
import { Roles } from '../shared/decorators/roles.decorator';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '../../core/ports/services/storage.service.port';

import { CreateMenuItemDto, MenuItemResponseDto, UpdateMenuItemDto } from '../../application/menu/dtos/menu.dto';
import { CreateOfferDto, OfferResponseDto, UpdateOfferDto } from '../../application/offers/dtos/offer.dto';
import { BusinessHourResponseDto, SetBusinessHoursDto } from '../../application/business-hours/dtos/business-hour.dto';
import { PublishOfferToInstagramUseCase } from '../../application/instagram/use-cases/publish-offer-to-instagram.use-case';

@ApiTags('Owner — Gestión del local')
@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@ApiBearerAuth('JWT')
export class OwnerController {
  private readonly logger = new Logger(OwnerController.name);

  constructor(
    @InjectRepository(PlaceOrmEntity)
    private readonly placeRepo: Repository<PlaceOrmEntity>,
    @InjectRepository(MenuItemOrmEntity)
    private readonly menuRepo: Repository<MenuItemOrmEntity>,
    @InjectRepository(BusinessHourOrmEntity)
    private readonly hoursRepo: Repository<BusinessHourOrmEntity>,
    @InjectRepository(OfferOrmEntity)
    private readonly offerRepo: Repository<OfferOrmEntity>,
    @InjectRepository(PlacePhotoOrmEntity)
    private readonly photoRepo: Repository<PlacePhotoOrmEntity>,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    private readonly publishOfferToInstagram: PublishOfferToInstagramUseCase,
  ) {}

  private async assertOwnership(placeId: string, ownerId: string): Promise<PlaceOrmEntity> {
    const place = await this.placeRepo.findOne({ where: { id: placeId } });
    if (!place) throw new NotFoundException('Local no encontrado');
    if (place.createdById !== ownerId) throw new ForbiddenException('No eres el dueño de este local');
    return place;
  }

  // ════════════════════════════════════════════════════════════
  // MENÚ
  // ════════════════════════════════════════════════════════════

  @Get('places/:placeId/menu')
  @ApiOperation({ summary: 'Ver menú de un local' })
  @ApiResponse({ status: 200, type: [MenuItemResponseDto] })
  async getMenu(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<MenuItemResponseDto[]> {
    await this.assertOwnership(placeId, user.sub);
    const items = await this.menuRepo.find({ where: { placeId }, order: { createdAt: 'ASC' } });
    return items.map(this.toMenuResponse);
  }

  @Post('places/:placeId/menu')
  @ApiOperation({ summary: 'Agregar ítem al menú' })
  @ApiResponse({ status: 201, type: MenuItemResponseDto })
  async addMenuItem(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() dto: CreateMenuItemDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<MenuItemResponseDto> {
    await this.assertOwnership(placeId, user.sub);
    const item = this.menuRepo.create({
      id: uuidv4(), placeId, name: dto.name,
      description: dto.description ?? null,
      price: dto.price, isAvailable: true,
    });
    const saved = await this.menuRepo.save(item);
    return this.toMenuResponse(saved);
  }

  @Patch('places/:placeId/menu/:id')
  @ApiOperation({ summary: 'Editar ítem del menú' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  async updateMenuItem(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<MenuItemResponseDto> {
    const item = await this.menuRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Ítem de menú no encontrado');
    await this.assertOwnership(item.placeId, user.sub);
    await this.menuRepo.update(id, {
      name: dto.name, description: dto.description ?? null,
      price: dto.price, isAvailable: dto.isAvailable,
    });
    const updated = await this.menuRepo.findOneOrFail({ where: { id } });
    return this.toMenuResponse(updated);
  }

  @Delete('places/:placeId/menu/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar ítem del menú' })
  async deleteMenuItem(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    const item = await this.menuRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    await this.assertOwnership(item.placeId, user.sub);
    await this.menuRepo.delete(id);
  }

  // ════════════════════════════════════════════════════════════
  // IMAGEN DEL MENÚ
  // ════════════════════════════════════════════════════════════

  private static readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  @Post('places/:placeId/menu-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!OwnerController.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(new Error('Solo se permiten imágenes JPEG, PNG o WebP'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir imagen del menú (se guarda como {nombre_local}_menu)' })
  async uploadMenuImage(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ menuImageUrl: string }> {
    if (!file) throw new Error('No se recibió ningún archivo');
    if (file.size > OwnerController.MAX_FILE_SIZE_BYTES) {
      throw new Error('El archivo supera el tamaño máximo de 5 MB');
    }
    const place = await this.assertOwnership(placeId, user.sub);
    const slug = place.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const publicId = `${slug}_menu`;
    const result = await this.storageService.upload(file, 'picacerca/menus', publicId);
    await this.placeRepo.update(placeId, { menuImageUrl: result.url });
    await this.photoRepo.save(
      this.photoRepo.create({
        id: uuidv4(),
        placeId,
        userId: user.sub,
        imageUrl: result.url,
        publicId: result.publicId,
      }),
    );
    return { menuImageUrl: result.url };
  }

  // ════════════════════════════════════════════════════════════
  // HORARIOS
  // ════════════════════════════════════════════════════════════

  @Get('places/:placeId/hours')
  @ApiOperation({ summary: 'Ver horarios de un local' })
  @ApiResponse({ status: 200, type: [BusinessHourResponseDto] })
  async getHours(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BusinessHourResponseDto[]> {
    await this.assertOwnership(placeId, user.sub);
    const hours = await this.hoursRepo.find({ where: { placeId }, order: { dayOfWeek: 'ASC' } });
    return hours.map(this.toHourResponse);
  }

  @Put('places/:placeId/hours')
  @ApiOperation({ summary: 'Establecer horarios completos (reemplaza todos)' })
  @ApiResponse({ status: 200, type: [BusinessHourResponseDto] })
  async setHours(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() dto: SetBusinessHoursDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BusinessHourResponseDto[]> {
    await this.assertOwnership(placeId, user.sub);
    await this.hoursRepo.delete({ placeId });
    const orms = dto.hours.map((h) =>
      this.hoursRepo.create({
        id: uuidv4(), placeId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime ?? null,
        closeTime: h.closeTime ?? null,
        isClosed: h.isClosed,
      }),
    );
    const saved = await this.hoursRepo.save(orms);
    return saved.map(this.toHourResponse);
  }

  // ════════════════════════════════════════════════════════════
  // OFERTAS
  // ════════════════════════════════════════════════════════════

  @Get('places/:placeId/offers')
  @ApiOperation({ summary: 'Ver todas las ofertas del local (activas, próximas y vencidas)' })
  @ApiResponse({ status: 200, type: [OfferResponseDto] })
  async getOffers(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<OfferResponseDto[]> {
    await this.assertOwnership(placeId, user.sub);
    const offers = await this.offerRepo.find({ where: { placeId }, order: { createdAt: 'DESC' } });
    return offers.map(this.toOfferResponse);
  }

  @Post('places/:placeId/offers')
  @ApiOperation({ summary: 'Crear oferta/promoción' })
  @ApiResponse({ status: 201, type: OfferResponseDto })
  async createOffer(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() dto: CreateOfferDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OfferResponseDto> {
    await this.assertOwnership(placeId, user.sub);
    const offer = this.offerRepo.create({
      id: uuidv4(), placeId,
      title: dto.title,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      discountType: dto.discountType,
      discountValue: dto.discountValue ?? null,
      validFrom: new Date(dto.validFrom),
      validTo: new Date(dto.validTo),
      isActive: true,
    });
    const saved = await this.offerRepo.save(offer);

    this.publishOfferToInstagram.execute(saved.id).catch((err: Error) =>
      this.logger.warn(`Instagram publish failed for offer ${saved.id}: ${err.message}`),
    );

    return this.toOfferResponse(saved);
  }

  @Patch('places/:placeId/offers/:id')
  @ApiOperation({ summary: 'Editar oferta' })
  @ApiResponse({ status: 200, type: OfferResponseDto })
  async updateOffer(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfferDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OfferResponseDto> {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Oferta no encontrada');
    await this.assertOwnership(offer.placeId, user.sub);
    await this.offerRepo.update(id, {
      ...(dto.title       !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description ?? null }),
      ...(dto.discountType  !== undefined && { discountType: dto.discountType }),
      ...(dto.discountValue !== undefined && { discountValue: dto.discountValue ?? null }),
      ...(dto.isActive    !== undefined && { isActive: dto.isActive }),
      ...(dto.validFrom   !== undefined && { validFrom: new Date(dto.validFrom) }),
      ...(dto.validTo     !== undefined && { validTo: new Date(dto.validTo) }),
    });
    const updated = await this.offerRepo.findOneOrFail({ where: { id } });
    return this.toOfferResponse(updated);
  }

  @Delete('places/:placeId/offers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar oferta' })
  async deleteOffer(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Oferta no encontrada');
    await this.assertOwnership(offer.placeId, user.sub);
    await this.offerRepo.delete(id);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private toMenuResponse(orm: MenuItemOrmEntity): MenuItemResponseDto {
    return {
      id: orm.id, placeId: orm.placeId, name: orm.name,
      description: orm.description ?? undefined,
      price: Number(orm.price),
      imageUrl: orm.imageUrl ?? undefined,
      isAvailable: orm.isAvailable,
      createdAt: orm.createdAt,
    };
  }

  private toHourResponse(orm: BusinessHourOrmEntity): BusinessHourResponseDto {
    return {
      dayOfWeek: orm.dayOfWeek,
      openTime: orm.openTime ?? undefined,
      closeTime: orm.closeTime ?? undefined,
      isClosed: orm.isClosed,
    };
  }

  private toOfferResponse(orm: OfferOrmEntity): OfferResponseDto {
    return {
      id: orm.id, placeId: orm.placeId, title: orm.title,
      description: orm.description ?? undefined,
      imageUrl: orm.imageUrl ?? undefined,
      discountType: orm.discountType,
      discountValue: orm.discountValue != null ? Number(orm.discountValue) : undefined,
      validFrom: orm.validFrom, validTo: orm.validTo,
      isActive: orm.isActive, createdAt: orm.createdAt,
      instagramPostId: orm.instagramPostId ?? undefined,
    };
  }
}
