import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../../core/domain/entities/user.entity';
import { IUserRepository } from '../../../../core/ports/repositories/user.repository.port';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from '../../mappers/user.mapper';
import { EncryptionService } from '../../../crypto/encryption.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
    private readonly encryption: EncryptionService,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDecryptedDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOne({ where: { email } });
    return orm ? this.toDecryptedDomain(orm) : null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const orm = UserMapper.toOrm(user);
    const saved = await this.repo.save(orm);
    return UserMapper.toDomain(saved);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    await this.repo.update(id, {
      name: data.name,
      avatarUrl: data.avatarUrl ?? null,
    });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return UserMapper.toDomain(updated);
  }

  async findAll(page: number, limit: number): Promise<{ users: UserEntity[]; total: number }> {
    const [orms, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { users: orms.map((o) => this.toDecryptedDomain(o)), total };
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    await this.repo.update(id, { isActive });
  }

  async saveInstagramToken(userId: string, token: string, metaUserId: string): Promise<void> {
    const encrypted = this.encryption.encrypt(token);
    await this.repo.update(userId, {
      instagramAccessToken: encrypted,
      instagramUserId: metaUserId,
    });
  }

  async clearInstagramToken(userId: string): Promise<void> {
    await this.repo.update(userId, { instagramAccessToken: null, instagramUserId: null });
  }

  private toDecryptedDomain(orm: UserOrmEntity): UserEntity {
    const domain = UserMapper.toDomain(orm);
    if (domain.instagramAccessToken) {
      try {
        domain.instagramAccessToken = this.encryption.decrypt(domain.instagramAccessToken);
      } catch {
        // Token no cifrado (migración) o corrupto — se deja tal cual para no romper el flujo
      }
    }
    return domain;
  }
}
