export type PriceRange = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

export interface Place {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  instagram?: string;
  priceRange: PriceRange;
  ratingAverage: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  menuImageUrl?: string;
  imageUrl?: string;
}

export interface NearbyPlace extends Place {
  distanceMeters: number;
}

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
  categoryId?: string;
  priceRange?: PriceRange;
}

export interface MenuItem {
  id: string;
  placeId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface BusinessHour {
  id: string;
  placeId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Offer {
  id: string;
  placeId: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'TWO_FOR_ONE' | 'FREE_ITEM';
  discountValue?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED';

export interface Report {
  id: string;
  userId: string;
  placeId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
}
