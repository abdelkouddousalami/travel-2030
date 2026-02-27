import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DestinationRequest, DestinationResponse, DestinationCategory, PageResponse } from '../models/destination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private readonly API_URL = `${environment.apiUrl}/destinations`;

  constructor(private http: HttpClient) {}

  getAllDestinations(page = 0, size = 10, sort = 'id,asc'): Observable<PageResponse<DestinationResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PageResponse<DestinationResponse>>(this.API_URL, { params });
  }

  searchDestinations(keyword: string, page = 0, size = 10): Observable<PageResponse<DestinationResponse>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<DestinationResponse>>(`${this.API_URL}/search`, { params });
  }

  getDestinationsByCategory(category: DestinationCategory, page = 0, size = 10): Observable<PageResponse<DestinationResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<DestinationResponse>>(`${this.API_URL}/category/${category}`, { params });
  }

  getDestinationById(id: number): Observable<DestinationResponse> {
    return this.http.get<DestinationResponse>(`${this.API_URL}/${id}`);
  }

  createDestination(request: DestinationRequest): Observable<DestinationResponse> {
    return this.http.post<DestinationResponse>(this.API_URL, request);
  }

  updateDestination(id: number, request: DestinationRequest): Observable<DestinationResponse> {
    return this.http.put<DestinationResponse>(`${this.API_URL}/${id}`, request);
  }

  deleteDestination(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
