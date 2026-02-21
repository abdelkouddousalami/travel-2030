export interface TripRequest {
  title: string;
  destination: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  status?: string;
  isPublic?: boolean;
  imageUrl?: string;
}

export interface TripResponse {
  id: number;
  title: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: string;
  isPublic: boolean;
  imageUrl: string;
  user: TripUserInfo;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripUserInfo {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}
