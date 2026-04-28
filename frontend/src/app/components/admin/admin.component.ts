import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { AdminStats, CommentSummary, UserSummary } from '../../models/admin.model';
import { ChatMessageResponse, ConversationSummary } from '../../models/chat.model';
import { BookingResponse, BookingStatus, BOOKING_STATUS_LABELS } from '../../models/booking.model';
import { TripResponse } from '../../models/trip.model';

type AdminTab = 'dashboard' | 'reservations' | 'trips' | 'users' | 'comments' | 'messages';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgChartsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  // ── General ──────────────────────────────────────────────────────────────
  activeTab: AdminTab = 'dashboard';
  stats: AdminStats | null = null;
  currentUser: any = null;

  // ── Charts (Dashboard) ───────────────────────────────────────────────────
  bookingsChartType: ChartType = 'doughnut';
  bookingsChartData: ChartData<'doughnut'> = {
    labels: ['En attente', 'Confirmées', 'Annulées'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#f0ad4e', '#28a745', '#dc3545'],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  tripsChartType: ChartType = 'bar';
  tripsChartData: ChartData<'bar'> = {
    labels: ['Planification', 'Confirmé', 'Terminé', 'Annulé'],
    datasets: [{
      label: 'Voyages',
      data: [0, 0, 0, 0],
      backgroundColor: ['#888', '#28a745', '#17a2b8', '#dc3545'],
      borderRadius: 6
    }]
  };

  usersChartType: ChartType = 'pie';
  usersChartData: ChartData<'pie'> = {
    labels: ['USER', 'ADMIN', 'GUIDE'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#000', '#555', '#999'],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  destinationsChartType: ChartType = 'bar';
  destinationsChartData: ChartData<'bar'> = {
    labels: ['BEACH', 'MOUNTAIN', 'CITY', 'ADVENTURE', 'CULTURAL', 'RELAXATION'],
    datasets: [{
      label: 'Destinations',
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: '#000',
      borderRadius: 6
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 } } }
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  // ── Comments ─────────────────────────────────────────────────────────────
  comments: CommentSummary[] = [];
  commentsPage = 0;
  commentsTotalPages = 0;
  commentsTotalElements = 0;
  isLoadingComments = false;
  commentSearch = '';
  deletingCommentId: number | null = null;

  // ── Bookings ─────────────────────────────────────────────────────────────
  bookings: BookingResponse[] = [];
  bookingsPage = 0;
  bookingsTotalPages = 0;
  bookingsTotalElements = 0;
  isLoadingBookings = false;
  statusFilter: BookingStatus | '' = '';
  updatingBookingId: number | null = null;

  statusLabels = BOOKING_STATUS_LABELS;
  statusOptions: { value: BookingStatus | ''; label: string }[] = [
    { value: '',          label: 'Tous les statuts' },
    { value: 'PENDING',   label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmée' },
    { value: 'CANCELLED', label: 'Annulée' },
    { value: 'COMPLETED', label: 'Terminée' }
  ];

  changeableStatuses: { value: BookingStatus; label: string }[] = [
    { value: 'PENDING',   label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmée' },
    { value: 'CANCELLED', label: 'Annulée' },
    { value: 'COMPLETED', label: 'Terminée' }
  ];

  // ── Trips ─────────────────────────────────────────────────────────────────
  trips: TripResponse[] = [];
  tripsPage = 0;
  tripsTotalPages = 0;
  tripsTotalElements = 0;
  isLoadingTrips = false;
  tripStatusFilter = '';

  tripStatusOptions: { value: string; label: string }[] = [
    { value: '',           label: 'Tous les voyages' },
    { value: 'PLANNING',   label: 'En planification' },
    { value: 'CONFIRMED',  label: 'Confirmé' },
    { value: 'COMPLETED',  label: 'Terminé' },
    { value: 'CANCELLED',  label: 'Annulé' }
  ];

  // ── Users ─────────────────────────────────────────────────────────────────
  users: UserSummary[] = [];
  isLoadingUsers = false;
  userSearch = '';

  // ── Messages ─────────────────────────────────────────────────────────────
  conversations: ConversationSummary[] = [];
  filteredConversations: ConversationSummary[] = [];
  selectedConversation: ConversationSummary | null = null;
  conversationMessages: ChatMessageResponse[] = [];
  isLoadingConversations = false;
  isLoadingMessages = false;
  conversationSearch = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
    this.loadBookings();
    this.loadTrips();
    this.loadUsers();
    this.loadComments();
    this.loadConversations();
  }

  // ── Tab ──────────────────────────────────────────────────────────────────

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: s => {
        this.stats = s;
        this.updateBookingsChart(s);
      },
      error: () => {}
    });
  }

  private updateBookingsChart(s: AdminStats): void {
    this.bookingsChartData = {
      ...this.bookingsChartData,
      datasets: [{
        ...this.bookingsChartData.datasets[0],
        data: [s.pendingBookings, s.confirmedBookings, s.cancelledBookings]
      }]
    };
  }

  private updateTripsChart(): void {
    const counts = { PLANNING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    this.trips.forEach(t => {
      const k = t.status as keyof typeof counts;
      if (k in counts) counts[k]++;
    });
    this.tripsChartData = {
      ...this.tripsChartData,
      datasets: [{
        ...this.tripsChartData.datasets[0],
        data: [counts.PLANNING, counts.CONFIRMED, counts.COMPLETED, counts.CANCELLED]
      }]
    };
  }

  private updateUsersChart(): void {
    const counts: Record<string, number> = { USER: 0, ADMIN: 0, GUIDE: 0 };
    this.users.forEach(u => {
      if (u.role in counts) counts[u.role]++;
    });
    this.usersChartData = {
      ...this.usersChartData,
      datasets: [{
        ...this.usersChartData.datasets[0],
        data: [counts['USER'], counts['ADMIN'], counts['GUIDE']]
      }]
    };
  }

  // ── Bookings ──────────────────────────────────────────────────────────────

  loadBookings(page = 0): void {
    this.isLoadingBookings = true;
    this.bookingsPage = page;
    this.adminService.getAllBookings(page, 15).subscribe({
      next: (res) => {
        this.bookings = res.content;
        this.bookingsTotalPages = res.totalPages;
        this.bookingsTotalElements = res.totalElements;
        this.isLoadingBookings = false;
      },
      error: () => { this.isLoadingBookings = false; }
    });
  }

  get filteredBookings(): BookingResponse[] {
    if (!this.statusFilter) return this.bookings;
    return this.bookings.filter(b => b.status === this.statusFilter);
  }

  filterByStatus(status: BookingStatus | ''): void {
    this.statusFilter = status;
  }

  changeBookingStatus(booking: BookingResponse, newStatus: BookingStatus): void {
    if (booking.status === newStatus) return;
    this.updatingBookingId = booking.id;
    this.adminService.updateBookingStatus(booking.id, newStatus).subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex(b => b.id === booking.id);
        if (idx >= 0) this.bookings[idx] = updated;
        this.updatingBookingId = null;
      },
      error: () => { this.updatingBookingId = null; }
    });
  }

  prevPage(): void {
    if (this.bookingsPage > 0) this.loadBookings(this.bookingsPage - 1);
  }

  nextPage(): void {
    if (this.bookingsPage < this.bookingsTotalPages - 1) this.loadBookings(this.bookingsPage + 1);
  }

  // ── Trips ──────────────────────────────────────────────────────────────────

  loadTrips(page = 0): void {
    this.isLoadingTrips = true;
    this.tripsPage = page;
    this.adminService.getAllTrips(page, 15).subscribe({
      next: (res) => {
        this.trips = res.content;
        this.tripsTotalPages = res.totalPages;
        this.tripsTotalElements = res.totalElements;
        this.isLoadingTrips = false;
        this.updateTripsChart();
      },
      error: () => { this.isLoadingTrips = false; }
    });
  }

  get filteredTrips(): TripResponse[] {
    if (!this.tripStatusFilter) return this.trips;
    return this.trips.filter(t => t.status === this.tripStatusFilter);
  }

  prevTripsPage(): void {
    if (this.tripsPage > 0) this.loadTrips(this.tripsPage - 1);
  }

  nextTripsPage(): void {
    if (this.tripsPage < this.tripsTotalPages - 1) this.loadTrips(this.tripsPage + 1);
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
        this.updateUsersChart();
      },
      error: () => { this.isLoadingUsers = false; }
    });
  }

  // ── Comments ───────────────────────────────────────────────────────────────

  loadComments(page = 0): void {
    this.isLoadingComments = true;
    this.commentsPage = page;
    this.adminService.getAllComments(page, 20).subscribe({
      next: (res) => {
        this.comments = res.content;
        this.commentsTotalPages = res.totalPages;
        this.commentsTotalElements = res.totalElements;
        this.isLoadingComments = false;
      },
      error: () => { this.isLoadingComments = false; }
    });
  }

  get filteredComments(): CommentSummary[] {
    const q = this.commentSearch.trim().toLowerCase();
    if (!q) return this.comments;
    return this.comments.filter(c =>
      c.content.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      (c.tripTitle || '').toLowerCase().includes(q)
    );
  }

  removeComment(c: CommentSummary): void {
    if (!confirm(`Supprimer ce commentaire de ${c.username} ?`)) return;
    this.deletingCommentId = c.id;
    this.adminService.deleteComment(c.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(x => x.id !== c.id);
        this.commentsTotalElements = Math.max(0, this.commentsTotalElements - 1);
        this.deletingCommentId = null;
      },
      error: () => { this.deletingCommentId = null; }
    });
  }

  prevCommentsPage(): void {
    if (this.commentsPage > 0) this.loadComments(this.commentsPage - 1);
  }

  nextCommentsPage(): void {
    if (this.commentsPage < this.commentsTotalPages - 1) this.loadComments(this.commentsPage + 1);
  }

  get filteredUsers(): UserSummary[] {
    const q = this.userSearch.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.firstName || '').toLowerCase().includes(q) ||
      (u.lastName || '').toLowerCase().includes(q)
    );
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  loadConversations(): void {
    this.isLoadingConversations = true;
    this.adminService.getAllConversations().subscribe({
      next: (convs) => {
        this.conversations = convs;
        this.filteredConversations = [...convs];
        this.isLoadingConversations = false;
      },
      error: () => { this.isLoadingConversations = false; }
    });
  }

  searchConversations(): void {
    const q = this.conversationSearch.trim().toLowerCase();
    if (!q) {
      this.filteredConversations = [...this.conversations];
      return;
    }
    this.filteredConversations = this.conversations.filter(c =>
      this.userDisplayName(c.participant1).toLowerCase().includes(q) ||
      this.userDisplayName(c.participant2).toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  }

  openConversation(conv: ConversationSummary): void {
    this.selectedConversation = conv;
    this.conversationMessages = [];
    this.isLoadingMessages = true;

    this.adminService
      .getConversationMessages(conv.participant1.id, conv.participant2.id)
      .subscribe({
        next: (msgs) => {
          this.conversationMessages = msgs;
          this.isLoadingMessages = false;
        },
        error: () => { this.isLoadingMessages = false; }
      });
  }

  closeConversation(): void {
    this.selectedConversation = null;
    this.conversationMessages = [];
  }

  isSenderParticipant1(msg: ChatMessageResponse): boolean {
    return this.selectedConversation?.participant1.id === msg.sender.id;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  userDisplayName(user: any): string {
    if (!user) return '—';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || '—';
  }

  getInitials(user: any): string {
    if (!user) return '?';
    const f = user.firstName?.[0] || '';
    const l = user.lastName?.[0] || '';
    return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getTimeAgo(date: string): string {
    const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (sec < 60)    return 'À l\'instant';
    if (sec < 3600)  return `Il y a ${Math.floor(sec / 60)} min`;
    if (sec < 86400) return `Il y a ${Math.floor(sec / 3600)}h`;
    if (sec < 604800) return `Il y a ${Math.floor(sec / 86400)}j`;
    return this.formatDate(date);
  }

  getDuration(start: string, end: string): number {
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  }

  getFullName(u: UserSummary): string {
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return name || u.username;
  }

  getTripStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PLANNING: 'Planification',
      CONFIRMED: 'Confirmé',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé'
    };
    return labels[status] || status;
  }

  formatBudget(budget: number | null): string {
    if (!budget) return '—';
    return budget.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' EUR';
  }

  getPublicTripsCount(): number {
    return this.trips.filter(t => t.isPublic).length;
  }

  getPrivateTripsCount(): number {
    return this.trips.filter(t => !t.isPublic).length;
  }

  getVerifiedUsersCount(): number {
    return this.users.filter(u => u.emailVerified).length;
  }

  getActiveUsersCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  truncate(text: string, max = 100): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
  }
}
