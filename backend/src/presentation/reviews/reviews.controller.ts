import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReviewUseCase } from '../../application/reviews/use-cases/create-review.use-case';
import { GetPlaceReviewsUseCase } from '../../application/reviews/use-cases/get-place-reviews.use-case';
import { UpdateReviewUseCase } from '../../application/reviews/use-cases/update-review.use-case';
import { DeleteReviewUseCase } from '../../application/reviews/use-cases/delete-review.use-case';
import { ReplyReviewUseCase } from '../../application/reviews/use-cases/reply-review.use-case';
import { UpdateReplyUseCase } from '../../application/reviews/use-cases/update-reply.use-case';
import {
  CreateReplyDto,
  CreateReviewDto,
  PaginatedReviewsDto,
  ReviewReplyResponseDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from '../../application/reviews/dtos/review.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../shared/decorators/current-user.decorator';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/domain/enums/user-role.enum';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getPlaceReviewsUseCase: GetPlaceReviewsUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly replyReviewUseCase: ReplyReviewUseCase,
    private readonly updateReplyUseCase: UpdateReplyUseCase,
  ) {}

  // ─── Reseñas de un local ────────────────────────────────────────────────────

  @Get('places/:placeId/reviews')
  @ApiOperation({ summary: 'Listar reseñas de un local con sus respuestas' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: PaginatedReviewsDto })
  async findByPlace(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedReviewsDto> {
    const { data, total } = await this.getPlaceReviewsUseCase.execute(
      placeId,
      Number(page),
      Number(limit),
    );

    return {
      data: data.map(({ review, reply }) => ({
        id: review.id,
        placeId: review.placeId,
        userId: review.userId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        foodQualityScore: review.foodQualityScore,
        priceQualityScore: review.priceQualityScore,
        serviceScore: review.serviceScore,
        cleanlinessScore: review.cleanlinessScore,
        reply: reply
          ? {
              id: reply.id,
              reviewId: reply.reviewId,
              ownerId: reply.ownerId,
              comment: reply.comment,
              createdAt: reply.createdAt,
            }
          : undefined,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  @Post('places/:placeId/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Crear reseña en un local (solo USER)' })
  @ApiResponse({ status: 201, type: ReviewResponseDto })
  async create(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReviewResponseDto> {
    const review = await this.createReviewUseCase.execute(placeId, dto, user);
    return this.toReviewResponse(review);
  }

  // ─── Editar / Eliminar reseña ────────────────────────────────────────────────

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Editar una reseña propia' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReviewResponseDto> {
    const review = await this.updateReviewUseCase.execute(id, dto, user);
    return this.toReviewResponse(review);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Eliminar una reseña propia' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.deleteReviewUseCase.execute(id, user);
  }

  // ─── Respuestas del OWNER ────────────────────────────────────────────────────

  @Post('reviews/:reviewId/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Responder una reseña (solo OWNER del local)' })
  @ApiResponse({ status: 201, type: ReviewReplyResponseDto })
  async reply(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Body() dto: CreateReplyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReviewReplyResponseDto> {
    const reply = await this.replyReviewUseCase.execute(reviewId, dto, user);
    return {
      id: reply.id,
      reviewId: reply.reviewId,
      ownerId: reply.ownerId,
      comment: reply.comment,
      createdAt: reply.createdAt,
    };
  }

  @Patch('reviews/:reviewId/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Editar la respuesta a una reseña (solo OWNER)' })
  @ApiResponse({ status: 200, type: ReviewReplyResponseDto })
  async updateReply(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Body() dto: CreateReplyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReviewReplyResponseDto> {
    const reply = await this.updateReplyUseCase.execute(reviewId, dto, user);
    return {
      id: reply.id,
      reviewId: reply.reviewId,
      ownerId: reply.ownerId,
      comment: reply.comment,
      createdAt: reply.createdAt,
    };
  }

  private toReviewResponse(review: any): ReviewResponseDto {
    return {
      id: review.id,
      placeId: review.placeId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      foodQualityScore: review.foodQualityScore,
      priceQualityScore: review.priceQualityScore,
      serviceScore: review.serviceScore,
      cleanlinessScore: review.cleanlinessScore,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
