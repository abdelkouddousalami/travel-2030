import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { BookingResponse, BookingStatus, BOOKING_STATUS_LABELS } from '../../models/booking.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent implements OnInit {
  bookings: BookingResponse[] = [];
  isLoading = false;
  currentPage = 0;
  totalPages = 0;
  statusFilter: BookingStatus | '' = '';
  statusLabels = BOOKING_STATUS_LABELS;

  statuses: { value: BookingStatus | ''; label: string }[] = [
    { value: '', label: 'Toutes' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmées' },
    { value: 'CANCELLED', label: 'Annulées' },
    { value: 'COMPLETED', label: 'Terminées' }
  ];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingService.getUserBookings(this.currentPage, 10).subscribe({
      next: (page) => {
        this.bookings = page.content;
        this.totalPages = page.totalPages;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  get filteredBookings(): BookingResponse[] {
    if (!this.statusFilter) return this.bookings;
    return this.bookings.filter(b => b.status === this.statusFilter);
  }

  filterByStatus(status: BookingStatus | ''): void {
    this.statusFilter = status;
  }

  cancelBooking(booking: BookingResponse): void {
    if (!confirm('Annuler cette réservation ?')) return;
    this.bookingService.updateBookingStatus(booking.id, 'CANCELLED').subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex(b => b.id === booking.id);
        if (idx >= 0) this.bookings[idx] = updated;
      }
    });
  }

  deleteBooking(booking: BookingResponse): void {
    if (!confirm('Supprimer cette réservation ?')) return;
    this.bookingService.deleteBooking(booking.id).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b.id !== booking.id);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  getDuration(start: string, end: string): number {
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadBookings();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBookings();
    }
  }
}
