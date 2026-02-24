import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(request: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/register`, request);
  }

  verifyOtp(request: VerifyOtpRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/verify-otp`, request)
      .pipe(
        tap(response => {
          this.saveTokens(response);
          this.saveUser(response);
          this.currentUserSubject.next(response);
        })
      );
  }

  resendOtp(request: ResendOtpRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/resend-otp`, request);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { username, password })
      .pipe(
        tap(response => {
          this.saveTokens(response);
          this.saveUser(response);
          this.currentUserSubject.next(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ token: string; refreshToken: string }>(
      `${this.API_URL}/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getCurrentUser(): LoginResponse | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private saveTokens(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
  }

  private saveUser(response: LoginResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
  }
}
