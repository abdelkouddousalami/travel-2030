import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should allow access when authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as any, {} as any);
    });

    expect(result).toBeTrue();
  });

  it('should redirect to login when not authenticated', () => {
    spyOn(router, 'navigate');
    authServiceMock.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as any, {} as any);
    });

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
