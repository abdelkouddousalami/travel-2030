import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { TripResponse } from '../../models/trip.model';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent implements OnInit {
  publicTrips: TripResponse[] = [];
  isLoading = false;
  currentUser: any = null;

  constructor(
    private tripService: TripService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPublicTrips();
  }

  loadPublicTrips(): void {
    this.isLoading = true;
    this.tripService.getPublicTrips().subscribe({
      next: (trips) => {
        this.publicTrips = trips;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  toggleLike(trip: TripResponse): void {
    if (!this.currentUser) return;
    this.tripService.toggleLike(trip.id).subscribe({
      next: (res) => {
        trip.isLikedByCurrentUser = res.liked;
        trip.likesCount = res.likesCount;
      }
    });
  }

  getInitials(user: any): string {
    if (!user) return '?';
    const f = user.firstName?.[0] || '';
    const l = user.lastName?.[0] || '';
    return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  getTimeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'A l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
