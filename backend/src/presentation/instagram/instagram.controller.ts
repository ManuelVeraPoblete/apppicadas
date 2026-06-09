import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../shared/decorators/current-user.decorator';
import { IUserRepository, USER_REPOSITORY } from '../../core/ports/repositories/user.repository.port';
import { UserRole } from '../../core/domain/enums/user-role.enum';

const DEEP_LINK_BASE = 'picacerca://oauth/instagram';

@ApiTags('Instagram — OAuth')
@Controller('instagram')
export class InstagramController {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obtener URL de OAuth para conectar Instagram' })
  getConnectUrl(@CurrentUser() user: JwtPayload): { url: string } {
    const state = this.jwtService.sign({ sub: user.sub }, { expiresIn: '10m' });
    const params = new URLSearchParams({
      client_id: this.configService.getOrThrow('META_APP_ID'),
      redirect_uri: this.configService.getOrThrow('META_REDIRECT_URI'),
      scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
      response_type: 'code',
      state,
    });
    return { url: `https://www.facebook.com/v21.0/dialog/oauth?${params}` };
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback OAuth de Meta — no llamar directamente' })
  async handleCallback(
    @Query('code') code: string | undefined,
    @Query('error') error: string | undefined,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    if (error || !code) {
      res.redirect(`${DEEP_LINK_BASE}?status=error`);
      return;
    }

    try {
      const { sub: userId } = this.jwtService.verify<{ sub: string }>(state);

      const appId = this.configService.getOrThrow('META_APP_ID');
      const appSecret = this.configService.getOrThrow('META_APP_SECRET');
      const redirectUri = this.configService.getOrThrow('META_REDIRECT_URI');

      const shortRes = await fetch(
        'https://graph.facebook.com/v21.0/oauth/access_token?' +
          new URLSearchParams({ client_id: appId, redirect_uri: redirectUri, client_secret: appSecret, code }),
      );
      if (!shortRes.ok) throw new Error(`Meta short token error: ${shortRes.status}`);
      const { access_token: shortToken } = (await shortRes.json()) as { access_token: string };
      if (!shortToken) throw new Error('Meta no devolvió short token');

      const longRes = await fetch(
        'https://graph.facebook.com/v21.0/oauth/access_token?' +
          new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: shortToken }),
      );
      if (!longRes.ok) throw new Error(`Meta long token error: ${longRes.status}`);
      const { access_token: longToken } = (await longRes.json()) as { access_token: string };
      if (!longToken) throw new Error('Meta no devolvió long token');

      const meRes = await fetch(`https://graph.facebook.com/me?access_token=${longToken}`);
      if (!meRes.ok) throw new Error(`Meta /me error: ${meRes.status}`);
      const { id: metaUserId } = (await meRes.json()) as { id: string };
      if (!metaUserId) throw new Error('Meta no devolvió user ID');

      await this.userRepo.saveInstagramToken(userId, longToken, metaUserId);
      res.redirect(`${DEEP_LINK_BASE}?status=success`);
    } catch {
      res.redirect(`${DEEP_LINK_BASE}?status=error`);
    }
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Ver si el owner tiene Instagram conectado' })
  async getStatus(@CurrentUser() user: JwtPayload): Promise<{ connected: boolean }> {
    const dbUser = await this.userRepo.findById(user.sub);
    return { connected: !!dbUser?.instagramAccessToken };
  }

  @Delete('disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Desconectar cuenta de Instagram' })
  async disconnect(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.userRepo.clearInstagramToken(user.sub);
  }
}
