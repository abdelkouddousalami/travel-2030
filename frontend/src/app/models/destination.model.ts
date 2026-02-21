export type DestinationCategory = 'BEACH' | 'MOUNTAIN' | 'CITY' | 'ADVENTURE' | 'CULTURAL' | 'RELAXATION';

export interface DestinationRequest {
  name: string;
  description?: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  imageUrl?: string;
  category: DestinationCategory;
}

export interface DestinationResponse {
  id: number;
  name: string;
  description: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  imageUrl: string;
  category: DestinationCategory;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const CATEGORY_LABELS: Record<DestinationCategory, string> = {
  BEACH: 'Plage',
  MOUNTAIN: 'Montagne',
  CITY: 'Ville',
  ADVENTURE: 'Aventure',
  CULTURAL: 'Culture',
  RELAXATION: 'Détente'
};
