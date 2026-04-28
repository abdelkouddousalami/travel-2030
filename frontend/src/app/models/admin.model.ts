export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  totalDestinations: number;
  totalBookings: number;
  totalMessages: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface CommentSummary {
  id: number;
  content: string;
  tripId: number;
  tripTitle: string;
  userId: number;
  username: string;
  userFullName: string;
  createdAt: string;
}
