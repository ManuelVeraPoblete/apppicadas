import { apiClient } from './client';
import { LoginDto, RegisterDto, LoginResponse, User } from '../types';

export const authApi = {
  login: (dto: LoginDto) =>
    apiClient.post<LoginResponse>('/auth/login', dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    apiClient.post<LoginResponse>('/auth/register', dto).then((r) => r.data),

  me: () =>
    apiClient.get<User>('/auth/me').then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }).catch(() => {}),
};
