import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUseCase } from '../../application/auth/use-cases/register.use-case';
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';
import { GetMeUseCase } from '../../application/auth/use-cases/get-me.use-case';
import { RegisterDto } from '../../application/auth/dtos/register.dto';
import { LoginDto } from '../../application/auth/dtos/login.dto';
import { RefreshTokenDto } from '../../application/auth/dtos/refresh-token.dto';
import { AuthResponseDto, AuthUserDto } from '../../application/auth/dtos/auth-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../shared/decorators/current-user.decorator';
import { IUserRepository, USER_REPOSITORY } from '../../core/ports/repositories/user.repository.port';
import { RevokedTokenOrmEntity } from '../../infrastructure/database/typeorm/entities/revoked-token.orm-entity';

type RefreshPayload = JwtPayload & { jti?: string; exp?: number };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @InjectRepository(RevokedTokenOrmEntity)
    private readonly revokedTokenRepo: Repository<RevokedTokenOrmEntity>,
  ) {}

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Registrar nuevo usuario (USER u OWNER)' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    await this.registerUseCase.execute(dto);
    return this.loginUseCase.execute({ email: dto.email, password: dto.password });
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login con email y contraseña' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token inválido, expirado o revocado' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { jwtSecret, jwtRefreshSecret } = this.getSecrets();

    let payload: RefreshPayload;
    try {
      payload = this.jwtService.verify<RefreshPayload>(dto.refreshToken, {
        secret: jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Verificar que no esté en la blacklist
    if (payload.jti) {
      const revoked = await this.revokedTokenRepo.findOne({ where: { jti: payload.jti } });
      if (revoked) throw new UnauthorizedException('Refresh token revocado');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // Revocar el token usado (rotación — cada refresh invalida el anterior)
    if (payload.jti && payload.exp) {
      await this.revokedTokenRepo.save({ jti: payload.jti, expiresAt: new Date(payload.exp * 1000) });
    }

    const tokenPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: jwtSecret,
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m') as any,
    });

    const refreshToken = this.jwtService.sign(
      { ...tokenPayload, jti: uuidv4() },
      {
        secret: jwtRefreshSecret,
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl ?? null,
        createdAt: user.createdAt,
      },
    };
  }

  @Post('logout')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar sesión e invalidar el refresh token' })
  @ApiResponse({ status: 204, description: 'Sesión cerrada' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    const { jwtRefreshSecret } = this.getSecrets();

    try {
      const payload = this.jwtService.verify<RefreshPayload>(dto.refreshToken, {
        secret: jwtRefreshSecret,
      });

      if (payload.jti && payload.exp) {
        const alreadyRevoked = await this.revokedTokenRepo.findOne({ where: { jti: payload.jti } });
        if (!alreadyRevoked) {
          await this.revokedTokenRepo.save({
            jti: payload.jti,
            expiresAt: new Date(payload.exp * 1000),
          });
        }
      }
    } catch {
      // Token ya inválido o expirado — logout silencioso
    }

    // Limpieza periódica: borrar entradas ya expiradas
    await this.revokedTokenRepo.delete({ expiresAt: LessThan(new Date()) });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obtener usuario autenticado actual' })
  @ApiResponse({ status: 200, type: AuthUserDto })
  async me(@CurrentUser() payload: JwtPayload) {
    const user = await this.getMeUseCase.execute(payload.sub);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }

  private getSecrets(): { jwtSecret: string; jwtRefreshSecret: string } {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT_SECRET y JWT_REFRESH_SECRET deben estar configurados');
    }
    return { jwtSecret, jwtRefreshSecret };
  }
}
