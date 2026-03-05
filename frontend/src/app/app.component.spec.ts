import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthService, LoginResponse } from './services/auth.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<LoginResponse | null>;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);

    authServiceMock = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: currentUserSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have title Travel2030', () => {
    expect(component.title).toEqual('Travel2030');
  });

  it('should initialize with menu closed', () => {
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should toggle menu', () => {
    expect(component.isMenuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should call authService.logout when logout is called', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should update currentUser when authService emits user', fakeAsync(() => {
    const mockUser: LoginResponse = {
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

    currentUserSubject.next(mockUser);
    tick();

    expect(component.currentUser).toEqual(mockUser);
  }));

  it('should set currentUser to null when no user is logged in', fakeAsync(() => {
    currentUserSubject.next(null);
    tick();

    expect(component.currentUser).toBeNull();
  }));
});
