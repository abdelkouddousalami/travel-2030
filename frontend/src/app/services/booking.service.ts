import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingRequest, BookingResponse, BookingStatus } from '../models/booking.model';
import { PageResponse } from '../models/destination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly API_URL = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getUserBookings(page = 0, size = 10): Observable<PageResponse<BookingResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<BookingResponse>>(this.API_URL, { params });
  }

  getAllBookings(page = 0, size = 10): Observable<PageResponse<BookingResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<BookingResponse>>(`${this.API_URL}/all`, { params });
  }

  getBookingById(id: number): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.API_URL}/${id}`);
  }

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.API_URL, request);
  }

  updateBookingStatus(id: number, status: BookingStatus): Observable<BookingResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<BookingResponse>(`${this.API_URL}/${id}/status`, null, { params });
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
