import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

import { RegisterUseCase } from '../../application/auth/use-cases/register.use-case';
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';
import { GetMeUseCase } from '../../application/auth/use-cases/get-me.use-case';

import { UserRepository } from '../../infrastructure/database/typeorm/repositories/user.repository';
import { UserOrmEntity } from '../../infrastructure/database/typeorm/entities/user.orm-entity';
import { RevokedTokenOrmEntity } from '../../infrastructure/database/typeorm/entities/revoked-token.orm-entity';
import { USER_REPOSITORY } from '../../core/ports/repositories/user.repository.port';
import { EncryptionService } from '../../infrastructure/crypto/encryption.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET debe estar configurado');
        return {
          secret,
          signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '15m') as any },
        };
      },
    }),
    TypeOrmModule.forFeature([UserOrmEntity, RevokedTokenOrmEntity]),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    RegisterUseCase,
    LoginUseCase,
    GetMeUseCase,
    EncryptionService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [
    JwtModule,
    PassportModule,
    EncryptionService,
    { provide: USER_REPOSITORY, useClass: UserRepository },
  ],
})
export class AuthModule {}
