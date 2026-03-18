import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { TripResponse } from '../../models/trip.model';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.css'
})
export class TripsComponent implements OnInit {
  trips: TripResponse[] = [];
  filteredTrips: TripResponse[] = [];
  selectedFilter: string = 'all';
  isLoading = false;

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoading = true;
    this.tripService.getMyTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
        this.filteredTrips = [...trips];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterTrips(filter: string): void {
    this.selectedFilter = filter;
    if (filter === 'all') {
      this.filteredTrips = [...this.trips];
    } else {
      this.filteredTrips = this.trips.filter(trip =>
        trip.status?.toUpperCase() === filter.toUpperCase()
      );
    }
  }

  deleteTrip(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce voyage?')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => {
          this.trips = this.trips.filter(t => t.id !== id);
          this.filterTrips(this.selectedFilter);
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PLANNING': 'En Planification',
      'CONFIRMED': 'Confirmé',
      'COMPLETED': 'Terminé'
    };
    return labels[status?.toUpperCase()] || status;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getDuration(start: string, end: string): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
