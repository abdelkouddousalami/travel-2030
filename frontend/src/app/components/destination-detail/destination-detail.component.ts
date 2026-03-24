import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { DestinationResponse, CATEGORY_LABELS } from '../../models/destination.model';
import { BookingRequest } from '../../models/booking.model';

@Component({
  selector: 'app-destination-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './destination-detail.component.html',
  styleUrl: './destination-detail.component.css'
})
export class DestinationDetailComponent implements OnInit {
  destination: DestinationResponse | null = null;
  isLoading = true;
  error: string | null = null;

  // Reservation form
  showReservationForm = false;
  startDate = '';
  endDate = '';
  numberOfNights = 0;
  totalPrice = 0;
  isSubmitting = false;
  reservationSuccess = false;
  reservationError: string | null = null;

  // Auth
  isAuthenticated = false;

  // Gallery images based on category
  galleryImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinationService: DestinationService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDestination(+id);
    }

    // Set minimum date for reservations
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.endDate = tomorrow.toISOString().split('T')[0];
  }

  loadDestination(id: number): void {
    this.isLoading = true;
    this.destinationService.getDestinationById(id).subscribe({
      next: (dest) => {
        this.destination = dest;
        this.galleryImages = this.getGalleryImages(dest);
        this.calculatePrice();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Destination non trouvée';
        this.isLoading = false;
      }
    });
  }

  getGalleryImages(dest: DestinationResponse): string[] {
    const categoryImages: Record<string, string[]> = {
      'BEACH': [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800'
      ],
      'MOUNTAIN': [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800'
      ],
      'CITY': [
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800'
      ],
      'ADVENTURE': [
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
        'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800'
      ],
      'CULTURAL': [
        'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=800',
        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800'
      ],
      'RELAXATION': [
        'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
      ]
    };

    if (dest.imageUrl) {
      return [dest.imageUrl, ...(categoryImages[dest.category] || []).slice(0, 3)];
    }
    return categoryImages[dest.category] || categoryImages['BEACH'];
  }

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
  }

  getMainImage(): string {
    return this.galleryImages[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
  }

  // Reservation methods
  toggleReservationForm(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.showReservationForm = !this.showReservationForm;
    this.reservationError = null;
    this.reservationSuccess = false;
  }

  onDateChange(): void {
    this.calculatePrice();
  }

  calculatePrice(): void {
    if (this.startDate && this.endDate && this.destination) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diffTime = end.getTime() - start.getTime();
      this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (this.numberOfNights > 0) {
        this.totalPrice = this.numberOfNights * this.destination.pricePerNight;
      } else {
        this.numberOfNights = 0;
        this.totalPrice = 0;
      }
    }
  }

  submitReservation(): void {
    if (!this.destination || this.numberOfNights <= 0) {
      this.reservationError = 'Veuillez sélectionner des dates valides';
      return;
    }

    this.isSubmitting = true;
    this.reservationError = null;

    const booking: BookingRequest = {
      destinationId: this.destination.id,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.bookingService.createBooking(booking).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.reservationSuccess = true;
        this.showReservationForm = false;
        setTimeout(() => {
          this.router.navigate(['/bookings']);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.reservationError = err.error?.message || 'Une erreur est survenue lors de la réservation';
      }
    });
  }

  getMinEndDate(): string {
    if (this.startDate) {
      const start = new Date(this.startDate);
      start.setDate(start.getDate() + 1);
      return start.toISOString().split('T')[0];
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/destinations']);
  }
}
