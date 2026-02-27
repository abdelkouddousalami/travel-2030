import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripRequest, TripResponse } from '../models/trip.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private readonly API_URL = `${environment.apiUrl}/trips`;

  constructor(private http: HttpClient) {}

  getMyTrips(): Observable<TripResponse[]> {
    return this.http.get<TripResponse[]>(`${this.API_URL}/my`);
  }

  getPublicTrips(): Observable<TripResponse[]> {
    return this.http.get<TripResponse[]>(`${this.API_URL}/public`);
  }

  getTripById(id: number): Observable<TripResponse> {
    return this.http.get<TripResponse>(`${this.API_URL}/${id}`);
  }

  createTrip(request: TripRequest): Observable<TripResponse> {
    return this.http.post<TripResponse>(this.API_URL, request);
  }

  updateTrip(id: number, request: TripRequest): Observable<TripResponse> {
    return this.http.put<TripResponse>(`${this.API_URL}/${id}`, request);
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  toggleLike(tripId: number): Observable<{ liked: boolean; likesCount: number }> {
    return this.http.post<{ liked: boolean; likesCount: number }>(
      `${this.API_URL}/${tripId}/likes/toggle`, {}
    );
  }
}
