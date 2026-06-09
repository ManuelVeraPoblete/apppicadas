import { UserEntity } from '../../domain/entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
  findAll(page: number, limit: number): Promise<{ users: UserEntity[]; total: number }>;
  updateStatus(id: string, isActive: boolean): Promise<void>;
  saveInstagramToken(userId: string, token: string, metaUserId: string): Promise<void>;
  clearInstagramToken(userId: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
