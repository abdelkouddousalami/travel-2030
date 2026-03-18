import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { DestinationResponse, DestinationCategory, CATEGORY_LABELS } from '../../models/destination.model';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './destinations.component.html',
  styleUrl: './destinations.component.css'
})
export class DestinationsComponent implements OnInit {
  destinations: DestinationResponse[] = [];
  isLoading = false;
  searchKeyword = '';
  selectedCategory: DestinationCategory | '' = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  categories: { value: DestinationCategory | ''; label: string }[] = [
    { value: '', label: 'Toutes' },
    { value: 'BEACH', label: 'Plage' },
    { value: 'MOUNTAIN', label: 'Montagne' },
    { value: 'CITY', label: 'Ville' },
    { value: 'ADVENTURE', label: 'Aventure' },
    { value: 'CULTURAL', label: 'Culture' },
    { value: 'RELAXATION', label: 'Détente' }
  ];

  categoryLabels = CATEGORY_LABELS;

  constructor(private destinationService: DestinationService) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.isLoading = true;

    if (this.searchKeyword.trim()) {
      this.destinationService.searchDestinations(this.searchKeyword, this.currentPage, 12).subscribe({
        next: (page) => {
          this.destinations = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else if (this.selectedCategory) {
      this.destinationService.getDestinationsByCategory(this.selectedCategory, this.currentPage, 12).subscribe({
        next: (page) => {
          this.destinations = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      this.destinationService.getAllDestinations(this.currentPage, 12).subscribe({
        next: (page) => {
          this.destinations = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  onSearch(): void {
    this.currentPage = 0;
    this.selectedCategory = '';
    this.loadDestinations();
  }

  onCategoryChange(category: DestinationCategory | ''): void {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.searchKeyword = '';
    this.loadDestinations();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadDestinations();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadDestinations();
    }
  }

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category as DestinationCategory] || category;
  }

  getDefaultImage(dest: DestinationResponse): string {
    if (dest.imageUrl) return dest.imageUrl;
    const images: Record<string, string> = {
      'BEACH': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      'MOUNTAIN': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
      'CITY': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
      'ADVENTURE': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400',
      'CULTURAL': 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=400',
      'RELAXATION': 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=400'
    };
    return images[dest.category] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
  }
}
