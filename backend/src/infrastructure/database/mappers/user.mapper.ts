import { UserEntity } from '../../../core/domain/entities/user.entity';
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): UserEntity {
    return new UserEntity(
      orm.id,
      orm.name,
      orm.email,
      orm.passwordHash,
      orm.role,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
      orm.avatarUrl ?? undefined,
      orm.instagramAccessToken ?? undefined,
      orm.instagramUserId ?? undefined,
    );
  }

  static toOrm(domain: UserEntity): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.email = domain.email;
    orm.passwordHash = domain.passwordHash;
    orm.role = domain.role;
    orm.isActive = domain.isActive;
    orm.avatarUrl = domain.avatarUrl ?? null;
    return orm;
  }
}
