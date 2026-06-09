import { UserRole } from '../enums/user-role.enum';

export class UserEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public avatarUrl?: string,
    public instagramAccessToken?: string,
    public instagramUserId?: string,
  ) {}
}
