import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats, CommentSummary, UserSummary } from '../models/admin.model';
import { ChatMessageResponse, ConversationSummary } from '../models/chat.model';
import { BookingResponse, BookingStatus } from '../models/booking.model';
import { PageResponse } from '../models/destination.model';
import { TripResponse } from '../models/trip.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.API_URL}/stats`);
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  getAllUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.API_URL}/users`);
  }

  // ── Trips ─────────────────────────────────────────────────────────────────

  getAllTrips(page = 0, size = 15): Observable<PageResponse<TripResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<TripResponse>>(`${this.API_URL}/trips`, { params });
  }

  // ── Comments ──────────────────────────────────────────────────────────────

  getAllComments(page = 0, size = 20): Observable<PageResponse<CommentSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<CommentSummary>>(`${this.API_URL}/comments`, { params });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/comments/${id}`);
  }

  // ── Bookings ───────────────────────────────────────────────────────────────

  getAllBookings(page = 0, size = 15): Observable<PageResponse<BookingResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<BookingResponse>>(`${this.API_URL}/bookings`, { params });
  }

  updateBookingStatus(id: number, status: BookingStatus): Observable<BookingResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<BookingResponse>(`${this.API_URL}/bookings/${id}/status`, null, { params });
  }

  // ── Chat ───────────────────────────────────────────────────────────────────

  getAllConversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${this.API_URL}/chat/conversations`);
  }

  getConversationMessages(userId1: number, userId2: number): Observable<ChatMessageResponse[]> {
    return this.http.get<ChatMessageResponse[]>(
      `${this.API_URL}/chat/conversations/${userId1}/${userId2}`
    );
  }
}
