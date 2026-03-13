import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { TripService } from '../../services/trip.service';
import { DestinationService } from '../../services/destination.service';
import { BookingService } from '../../services/booking.service';
import { Post, Comment, CreatePostRequest } from '../../models/post.model';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

interface QuickStat {
  label: string;
  value: number;
  icon: string;
  trend?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  isAdmin = false;

  // Posts
  posts: Post[] = [];
  showPostForm = false;
  newPost: CreatePostRequest = {
    type: 'post',
    title: '',
    content: ''
  };
  newCommentContent: { [postId: number]: string } = {};
  activeFilter: 'all' | 'announcement' | 'advice' | 'post' = 'all';
  isSubmitting = false;

  quickStats: QuickStat[] = [
    { label: 'Mes Voyages', value: 0, icon: '[TRIP]', trend: '+2' },
    { label: 'Destinations', value: 0, icon: '[DEST]' },
    { label: 'Reservations', value: 0, icon: '[BOOK]', trend: '+1' },
    { label: 'Commentaires', value: 0, icon: '[MSG]' }
  ];

  mainCards: DashboardCard[] = [
    {
      title: 'Mes Voyages',
      description: 'Creez et gerez vos voyages',
      icon: '[TRIP]',
      route: '/trips',
      color: '#000'
    },
    {
      title: 'Destinations',
      description: 'Explorez les destinations',
      icon: '[DEST]',
      route: '/destinations',
      color: '#333'
    },
    {
      title: 'Hebergements',
      description: 'Trouvez votre logement ideal',
      icon: '[HOTEL]',
      route: '/accommodations',
      color: '#555'
    },
    {
      title: 'Communaute',
      description: 'Connectez-vous avec d\'autres voyageurs',
      icon: '[USERS]',
      route: '/community',
      color: '#777'
    }
  ];

  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private tripService: TripService,
    private destinationService: DestinationService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'ADMIN';
      this.loadDashboardData();
    });

    this.postService.posts$.subscribe(posts => {
      this.posts = posts;
      this.updateCommentsCount();
    });
  }

  loadDashboardData(): void {
    // Fetch real stats from APIs
    this.tripService.getMyTrips().subscribe({
      next: (trips) => {
        this.quickStats[0].value = trips.length;
        this.recentActivities = trips.slice(0, 3).map(t => ({
          type: 'trip',
          title: `Voyage: ${t.title}`,
          date: new Date(t.createdAt),
          icon: '[TRIP]'
        }));
      }
    });

    this.destinationService.getAllDestinations(0, 1).subscribe({
      next: (page) => this.quickStats[1].value = page.totalElements
    });

    this.bookingService.getUserBookings(0, 1).subscribe({
      next: (page) => this.quickStats[2].value = page.totalElements
    });

    this.quickStats[3].value = this.getTotalComments();
  }

  updateCommentsCount(): void {
    const totalComments = this.getTotalComments();
    this.quickStats[3].value = totalComments;
  }

  getTotalComments(): number {
    return this.posts.reduce((sum, post) => sum + post.commentsCount, 0);
  }

  // Post methods
  togglePostForm(): void {
    this.showPostForm = !this.showPostForm;
    if (!this.showPostForm) {
      this.resetPostForm();
    }
  }

  resetPostForm(): void {
    this.newPost = {
      type: 'post',
      title: '',
      content: ''
    };
  }

  submitPost(): void {
    if (!this.newPost.title.trim() || !this.newPost.content.trim()) {
      return;
    }

    this.isSubmitting = true;
    this.postService.createPost(this.newPost, this.currentUser).subscribe({
      next: () => {
        this.showPostForm = false;
        this.resetPostForm();
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  filterPosts(filter: 'all' | 'announcement' | 'advice' | 'post'): void {
    this.activeFilter = filter;
  }

  get filteredPosts(): Post[] {
    if (this.activeFilter === 'all') {
      return this.posts;
    }
    return this.posts.filter(post => post.type === this.activeFilter);
  }

  toggleLike(post: Post): void {
    this.postService.toggleLike(post.id).subscribe();
  }

  toggleComments(post: Post): void {
    post.showComments = !post.showComments;
  }

  submitComment(post: Post): void {
    const content = this.newCommentContent[post.id];
    if (!content?.trim()) {
      return;
    }

    this.postService.addComment({ postId: post.id, content: content.trim() }, this.currentUser).subscribe({
      next: () => {
        this.newCommentContent[post.id] = '';
      }
    });
  }

  toggleCommentLike(post: Post, comment: Comment): void {
    this.postService.toggleCommentLike(post.id, comment.id).subscribe();
  }

  deletePost(post: Post): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(post.id).subscribe();
    }
  }

  deleteComment(post: Post, comment: Comment): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.postService.deleteComment(post.id, comment.id).subscribe();
    }
  }

  canEditPost(post: Post): boolean {
    return this.currentUser?.id === post.authorId || this.isAdmin;
  }

  canEditComment(comment: Comment): boolean {
    return this.currentUser?.id === comment.authorId || this.isAdmin;
  }

  getPostTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'announcement': 'ANNOUNCEMENT',
      'advice': 'ADVICE',
      'post': 'POST'
    };
    return labels[type] || 'POST';
  }

  getPostTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'announcement': '[!]',
      'advice': '[i]',
      'post': '[#]'
    };
    return icons[type] || '[#]';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getTimeAgo(date: Date): string {
    const inputDate = new Date(date);
    const seconds = Math.floor((new Date().getTime() - inputDate.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day(s) ago`;
    return inputDate.toLocaleDateString();
  }
}
