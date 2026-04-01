import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AuthService, LoginResponse, RegisterRequest, MessageResponse } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockLoginResponse: LoginResponse = {
    token: 'test-jwt-token',
    refreshToken: 'test-refresh-token',
    type: 'Bearer',
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER',
    firstName: 'Test',
    lastName: 'User'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should send registration request', () => {
      const registerRequest: RegisterRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const mockResponse: MessageResponse = {
        message: 'Registration successful',
        success: true
      };

      service.register(registerRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    it('should login and store tokens', () => {
      service.login('testuser', 'password').subscribe(response => {
        expect(response).toEqual(mockLoginResponse);
        expect(localStorage.getItem('auth_token')).toBe(mockLoginResponse.token);
        expect(localStorage.getItem('refresh_token')).toBe(mockLoginResponse.refreshToken);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'testuser', password: 'password' });
      req.flush(mockLoginResponse);
    });

    it('should update currentUser$ on login', (done) => {
      service.login('testuser', 'password').subscribe(() => {
        service.currentUser$.subscribe(user => {
          expect(user).toEqual(mockLoginResponse);
          done();
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);
    });
  });

  describe('logout', () => {
    it('should clear tokens and navigate to login', () => {
      spyOn(router, 'navigate');

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'stored-token');
      expect(service.getToken()).toBe('stored-token');
    });

    it('should return null if no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if no token', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false if token is expired', () => {
      // Create an expired JWT (exp in the past)
      const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 3600 };
      const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
      localStorage.setItem('auth_token', expiredToken);

      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true if token is valid', () => {
      // Create a valid JWT (exp in the future)
      const validPayload = { exp: Math.floor(Date.now() / 1000) + 3600 };
      const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;
      localStorage.setItem('auth_token', validToken);

      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage', () => {
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));
      expect(service.getCurrentUser()).toEqual(mockLoginResponse);
    });

    it('should return null if no user stored', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('current_user', 'invalid-json');
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true if user has the role', () => {
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));
      expect(service.hasRole('USER')).toBeTrue();
    });

    it('should return false if user does not have the role', () => {
      localStorage.setItem('current_user', JSON.stringify(mockLoginResponse));
      expect(service.hasRole('ADMIN')).toBeFalse();
    });

    it('should return false if no user', () => {
      expect(service.hasRole('USER')).toBeFalse();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and update localStorage', () => {
      localStorage.setItem('refresh_token', 'old-refresh-token');

      const newTokens = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(newTokens);
        expect(localStorage.getItem('auth_token')).toBe(newTokens.token);
        expect(localStorage.getItem('refresh_token')).toBe(newTokens.refreshToken);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush(newTokens);
    });
  });
});
