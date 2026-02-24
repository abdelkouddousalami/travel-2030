import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  healthCheck(): Observable<{ status: string; message: string }> {
    return this.http.get<{ status: string; message: string }>(`${this.apiUrl}/health`);
  }
}
