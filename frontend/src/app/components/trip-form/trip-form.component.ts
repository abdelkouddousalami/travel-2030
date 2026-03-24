import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { TripRequest, TripResponse } from '../../models/trip.model';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-form.component.html',
  styleUrl: './trip-form.component.css'
})
export class TripFormComponent implements OnInit {
  isEditMode = false;
  tripId: number | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  trip: TripRequest = {
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: undefined,
    status: 'PLANNING',
    isPublic: false,
    imageUrl: ''
  };

  constructor(
    private tripService: TripService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tripId = +id;
      this.loadTrip();
    }
  }

  loadTrip(): void {
    if (!this.tripId) return;
    this.isLoading = true;
    this.tripService.getTripById(this.tripId).subscribe({
      next: (trip: TripResponse) => {
        this.trip = {
          title: trip.title,
          destination: trip.destination,
          description: trip.description || '',
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.budget,
          status: trip.status,
          isPublic: trip.isPublic,
          imageUrl: trip.imageUrl || ''
        };
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le voyage.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.isSaving = true;
    this.errorMessage = '';

    const request = { ...this.trip };

    const obs = this.isEditMode && this.tripId
      ? this.tripService.updateTrip(this.tripId, request)
      : this.tripService.createTrip(request);

    obs.subscribe({
      next: () => {
        this.router.navigate(['/trips']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Une erreur est survenue.';
        this.isSaving = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.trip.title?.trim() && this.trip.destination?.trim()
      && this.trip.startDate && this.trip.endDate);
  }

  cancel(): void {
    this.router.navigate(['/trips']);
  }
}
