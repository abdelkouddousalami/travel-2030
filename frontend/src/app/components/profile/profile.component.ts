import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { TripService } from '../../services/trip.service';
import { BookingService } from '../../services/booking.service';
import { TripResponse } from '../../models/trip.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: LoginResponse | null = null;
  myTrips: TripResponse[] = [];
  bookingsCount = 0;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private tripService: TripService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats(): void {
    this.tripService.getMyTrips().subscribe({
      next: (trips) => {
        this.myTrips = trips;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });

    this.bookingService.getUserBookings(0, 1).subscribe({
      next: (page) => this.bookingsCount = page.totalElements
    });
  }

  getInitials(): string {
    if (!this.user) return '?';
    const f = this.user.firstName?.[0] || '';
    const l = this.user.lastName?.[0] || '';
    return (f + l).toUpperCase() || this.user.username?.[0]?.toUpperCase() || '?';
  }

  getFullName(): string {
    if (!this.user) return '';
    if (this.user.firstName || this.user.lastName) {
      return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
    }
    return this.user.username;
  }
}
