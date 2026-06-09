import { apiClient } from './client';
import { MenuItem, BusinessHour, Offer } from '../types';

export const ownerApi = {
  // Menu
  getMenu: (placeId: string) =>
    apiClient.get<MenuItem[]>(`/owner/places/${placeId}/menu`).then((r) => r.data),

  createMenuItem: (placeId: string, dto: Partial<MenuItem>) =>
    apiClient.post<MenuItem>(`/owner/places/${placeId}/menu`, dto).then((r) => r.data),

  updateMenuItem: (placeId: string, itemId: string, dto: Partial<MenuItem>) =>
    apiClient.patch<MenuItem>(`/owner/places/${placeId}/menu/${itemId}`, dto).then((r) => r.data),

  deleteMenuItem: (placeId: string, itemId: string) =>
    apiClient.delete(`/owner/places/${placeId}/menu/${itemId}`),

  // Business hours
  getHours: (placeId: string) =>
    apiClient.get<BusinessHour[]>(`/owner/places/${placeId}/hours`).then((r) => r.data),

  setHours: (placeId: string, hours: Partial<BusinessHour>[]) =>
    apiClient.put<BusinessHour[]>(`/owner/places/${placeId}/hours`, { hours }).then((r) => r.data),

  // Offers
  getOffers: (placeId: string) =>
    apiClient.get<Offer[]>(`/owner/places/${placeId}/offers`).then((r) => r.data),

  createOffer: (placeId: string, dto: Partial<Offer>) =>
    apiClient.post<Offer>(`/owner/places/${placeId}/offers`, dto).then((r) => r.data),

  updateOffer: (placeId: string, offerId: string, dto: Partial<Offer>) =>
    apiClient.patch<Offer>(`/owner/places/${placeId}/offers/${offerId}`, dto).then((r) => r.data),

  deleteOffer: (placeId: string, offerId: string) =>
    apiClient.delete(`/owner/places/${placeId}/offers/${offerId}`),

  // Instagram
  getInstagramConnectUrl: () =>
    apiClient.get<{ url: string }>('/instagram/connect').then((r) => r.data),

  getInstagramStatus: () =>
    apiClient.get<{ connected: boolean }>('/instagram/status').then((r) => r.data),

  disconnectInstagram: () =>
    apiClient.delete('/instagram/disconnect'),

  uploadMenuImage: async (placeId: string, imageUri: string, placeName: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `${placeName}_menu.jpg`,
    } as any);
    const { data } = await apiClient.post<{ menuImageUrl: string }>(
      `/owner/places/${placeId}/menu-image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
