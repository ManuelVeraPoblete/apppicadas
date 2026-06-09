import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CategoryOrmEntity } from '../../infrastructure/database/typeorm/entities/category.orm-entity';
import { CategoryMapper } from '../../infrastructure/database/mappers/category.mapper';
import { CategoryEntity } from '../../core/domain/entities/category.entity';
import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../application/categories/dtos/category.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/domain/enums/user-role.enum';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías activas' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async findAll(): Promise<CategoryResponseDto[]> {
    const orms = await this.categoryRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return orms.map(this.toResponse);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Listar todas las categorías incluyendo inactivas (ADMIN)' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async findAllAdmin(): Promise<CategoryResponseDto[]> {
    const orms = await this.categoryRepo.find({ order: { name: 'ASC' } });
    return orms.map(this.toResponse);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Crear categoría (solo ADMIN)' })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = new CategoryEntity(
      uuidv4(),
      dto.name,
      dto.slug,
      true,
      new Date(),
      dto.emoji,
    );
    const orm = CategoryMapper.toOrm(category);
    const saved = await this.categoryRepo.save(orm);
    return this.toResponse(saved);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Actualizar categoría (solo ADMIN)' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.categoryRepo.update(id, {
      name: dto.name,
      slug: dto.slug,
      icon: dto.emoji,
      isActive: dto.isActive,
    });
    const updated = await this.categoryRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Categoría no encontrada');
    return this.toResponse(updated);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Desactivar categoría (solo ADMIN) — soft delete reversible' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryResponseDto> {
    await this.categoryRepo.update(id, { isActive: false });
    const updated = await this.categoryRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Categoría no encontrada');
    return this.toResponse(updated);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Reactivar categoría desactivada (solo ADMIN)' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryResponseDto> {
    await this.categoryRepo.update(id, { isActive: true });
    const updated = await this.categoryRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Categoría no encontrada');
    return this.toResponse(updated);
  }

  private toResponse(orm: CategoryOrmEntity): CategoryResponseDto {
    return {
      id: orm.id,
      name: orm.name,
      slug: orm.slug,
      emoji: orm.icon ?? undefined,
      isActive: orm.isActive,
    };
  }
}
