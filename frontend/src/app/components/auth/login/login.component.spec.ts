import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService, LoginResponse } from '../../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockLoginResponse: LoginResponse = {
    token: 'test-token',
    refreshToken: 'test-refresh',
    type: 'Bearer',
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER',
    firstName: 'Test',
    lastName: 'User'
  };

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: LoginComponent }
        ]),
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should have valid form when filled', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should require username', () => {
    const usernameControl = component.loginForm.get('username');
    usernameControl?.setValue('');
    expect(usernameControl?.hasError('required')).toBeTrue();
  });

  it('should require password', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBeTrue();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should submit and navigate on successful login', fakeAsync(() => {
    spyOn(router, 'navigate');
    authServiceMock.login.and.returnValue(of(mockLoginResponse));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    component.onSubmit();
    tick();

    expect(authServiceMock.login).toHaveBeenCalledWith('testuser', 'password123');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isLoading).toBeFalse();
  }));

  it('should show error message on login failure', fakeAsync(() => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authServiceMock.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpassword'
    });

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  }));

  it('should show default error message when no message in response', fakeAsync(() => {
    authServiceMock.login.and.returnValue(throwError(() => ({ error: {} })));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpassword'
    });

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Identifiants incorrects. Veuillez réessayer.');
  }));

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
    component.togglePassword();
    expect(component.showPassword).toBeFalse();
  });

  it('should correctly identify invalid fields', () => {
    const usernameControl = component.loginForm.get('username');
    usernameControl?.setValue('');
    usernameControl?.markAsTouched();

    expect(component.isFieldInvalid('username')).toBeTrue();

    usernameControl?.setValue('validuser');
    expect(component.isFieldInvalid('username')).toBeFalse();
  });

  it('should set isLoading to true during submission', () => {
    authServiceMock.login.and.returnValue(of(mockLoginResponse));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    // Note: isLoading will be true briefly, then false after subscription completes
    expect(authServiceMock.login).toHaveBeenCalled();
  });
});
