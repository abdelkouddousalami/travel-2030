import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./components/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'destinations',
    loadComponent: () => import('./components/destinations/destinations.component').then(m => m.DestinationsComponent)
  },
  {
    path: 'destinations/:id',
    loadComponent: () => import('./components/destination-detail/destination-detail.component').then(m => m.DestinationDetailComponent)
  },
  {
    path: 'trips',
    loadComponent: () => import('./components/trips/trips.component').then(m => m.TripsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'trips/new',
    loadComponent: () => import('./components/trip-form/trip-form.component').then(m => m.TripFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'trips/:id',
    loadComponent: () => import('./components/trip-detail/trip-detail.component').then(m => m.TripDetailComponent)
  },
  {
    path: 'trips/:id/edit',
    loadComponent: () => import('./components/trip-form/trip-form.component').then(m => m.TripFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'bookings',
    loadComponent: () => import('./components/bookings/bookings.component').then(m => m.BookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'community',
    loadComponent: () => import('./components/community/community.component').then(m => m.CommunityComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];
