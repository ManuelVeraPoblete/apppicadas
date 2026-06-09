export type UserRole = 'USER' | 'OWNER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'OWNER';
}

export interface LoginDto {
  email: string;
  password: string;
}
