import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentRequest, CommentResponse } from '../models/comment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly API_URL = `${environment.apiUrl}/trips`;

  constructor(private http: HttpClient) {}

  getTripComments(tripId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.API_URL}/${tripId}/comments`);
  }

  addComment(tripId: number, request: CommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.API_URL}/${tripId}/comments`, request);
  }

  deleteComment(tripId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${tripId}/comments/${commentId}`);
  }
}
