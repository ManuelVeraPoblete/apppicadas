import { apiClient } from './client';
import { NearbyPlace, NearbyQuery, Place, Category, MenuItem, BusinessHour, Offer } from '../types';

export const placesApi = {
  getNearby: (query: NearbyQuery) =>
    apiClient.get<NearbyPlace[]>('/places/nearby', { params: query }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Place>(`/places/${id}`).then((r) => r.data),

  getMyPlace: () =>
    apiClient.get<Place | null>('/places/my-place').then((r) => r.data),

  create: (dto: Partial<Place>) =>
    apiClient.post<Place>('/places', dto).then((r) => r.data),

  update: (id: string, dto: Partial<Place>) =>
    apiClient.patch<Place>(`/places/${id}`, dto).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/places/${id}`),

  getMenu: (placeId: string) =>
    apiClient.get<MenuItem[]>(`/places/${placeId}/menu`).then((r) => r.data),

  getHours: (placeId: string) =>
    apiClient.get<BusinessHour[]>(`/places/${placeId}/hours`).then((r) => r.data),

  getOffers: (placeId: string) =>
    apiClient.get<Offer[]>(`/places/${placeId}/offers`).then((r) => r.data),
};

export const categoriesApi = {
  getAll: () =>
    apiClient.get<Category[]>('/categories').then((r) => r.data),
};

export const favoritesApi = {
  getAll: () =>
    apiClient.get<Place[]>('/users/me/favorites').then((r) => r.data),

  add: (placeId: string) =>
    apiClient.post(`/places/${placeId}/favorite`),

  remove: (placeId: string) =>
    apiClient.delete(`/places/${placeId}/favorite`),
};
