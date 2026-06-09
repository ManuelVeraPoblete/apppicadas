import { apiClient } from './client';
import { Place, Category, Report, ReportStatus } from '../types';

export const adminApi = {
  // ── Reports ──────────────────────────────────────────────────────────────────
  getReports: (params?: { status?: ReportStatus; page?: number; limit?: number }) =>
    apiClient
      .get<{ data: Report[]; total: number; page: number; limit: number }>('/admin/reports', { params })
      .then((r) => r.data),

  updateReportStatus: (id: string, status: ReportStatus) =>
    apiClient.patch<Report>(`/admin/reports/${id}/status`, { status }).then((r) => r.data),

  // ── Places ───────────────────────────────────────────────────────────────────
  getAllPlaces: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<{ data: Place[]; total: number }>('/places/admin/all', { params })
      .then((r) => r.data),

  verifyPlace: (id: string) =>
    apiClient.patch<Place>(`/places/admin/${id}/verify`).then((r) => r.data),

  // ── Categories ───────────────────────────────────────────────────────────────
  getAllCategories: () =>
    apiClient.get<Category[]>('/categories/all').then((r) => r.data),

  createCategory: (dto: { name: string; slug: string; emoji?: string }) =>
    apiClient.post<Category>('/categories', dto).then((r) => r.data),

  updateCategory: (id: string, dto: { name?: string; slug?: string; emoji?: string }) =>
    apiClient.patch<Category>(`/categories/${id}`, dto).then((r) => r.data),

  deactivateCategory: (id: string) =>
    apiClient.patch<Category>(`/categories/${id}/deactivate`).then((r) => r.data),

  activateCategory: (id: string) =>
    apiClient.patch<Category>(`/categories/${id}/activate`).then((r) => r.data),
};
