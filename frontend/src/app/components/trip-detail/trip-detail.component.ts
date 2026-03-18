import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { TripResponse } from '../../models/trip.model';
import { CommentResponse } from '../../models/comment.model';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.css'
})
export class TripDetailComponent implements OnInit {
  trip: TripResponse | null = null;
  comments: CommentResponse[] = [];
  newComment = '';
  isLoading = true;
  isSubmitting = false;
  currentUser: any = null;

  constructor(
    private tripService: TripService,
    private commentService: CommentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTrip(+id);
    }
  }

  loadTrip(id: number): void {
    this.isLoading = true;
    this.tripService.getTripById(id).subscribe({
      next: (trip) => {
        this.trip = trip;
        this.loadComments(id);
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/trips']);
      }
    });
  }

  loadComments(tripId: number): void {
    this.commentService.getTripComments(tripId).subscribe({
      next: (comments) => this.comments = comments
    });
  }

  toggleLike(): void {
    if (!this.trip) return;
    this.tripService.toggleLike(this.trip.id).subscribe({
      next: (res) => {
        if (this.trip) {
          this.trip.isLikedByCurrentUser = res.liked;
          this.trip.likesCount = res.likesCount;
        }
      }
    });
  }

  submitComment(): void {
    if (!this.trip || !this.newComment.trim()) return;
    this.isSubmitting = true;
    this.commentService.addComment(this.trip.id, { content: this.newComment.trim() }).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
        this.isSubmitting = false;
        if (this.trip) this.trip.commentsCount++;
      },
      error: () => this.isSubmitting = false
    });
  }

  deleteComment(comment: CommentResponse): void {
    if (!this.trip || !confirm('Supprimer ce commentaire ?')) return;
    this.commentService.deleteComment(this.trip.id, comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        if (this.trip) this.trip.commentsCount--;
      }
    });
  }

  canDeleteComment(comment: CommentResponse): boolean {
    return this.currentUser?.id === comment.user?.id || this.currentUser?.role === 'ADMIN';
  }

  isOwner(): boolean {
    return this.currentUser?.id === this.trip?.user?.id;
  }

  deleteTrip(): void {
    if (!this.trip || !confirm('Supprimer ce voyage ?')) return;
    this.tripService.deleteTrip(this.trip.id).subscribe({
      next: () => this.router.navigate(['/trips'])
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PLANNING': 'En Planification',
      'CONFIRMED': 'Confirmé',
      'COMPLETED': 'Terminé'
    };
    return labels[status] || status;
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

  getDuration(): number {
    if (!this.trip) return 0;
    const diff = new Date(this.trip.endDate).getTime() - new Date(this.trip.startDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getInitials(user: any): string {
    if (!user) return '?';
    const f = user.firstName?.[0] || '';
    const l = user.lastName?.[0] || '';
    return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
  }
}
