import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour.model';
import { LocationMapComponent } from './location-map.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule, LocationMapComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private tourService = inject(TourService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = signal('');
  tours = signal<Tour[]>([]);

  filteredTours = computed(() =>
    this.tourService.filterTours(this.tours(), this.searchQuery())
  );

  isLoggedIn = computed(() => this.authService.isUserAuthenticated()());

  ngOnInit(): void {
    this.loadTours();
  }

  private async loadTours(): Promise<void> {
    try {
      const tours = await this.tourService.getTours();
      this.tours.set(tours);
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to load tours:', err);
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value.toLowerCase());
  }

  addTour(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/tour', 'new']);
  }

  goToTour(id: string): void {
    this.router.navigate(['/tour', id]);
  }

  editTour(tourId: string): void {
    this.router.navigate(['/tour', tourId], { queryParams: { edit: true } });
  }

  async deleteTour(tourId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }
    try {
      await this.tourService.deleteTour(tourId);
      this.tours.update(ts => ts.filter(t => t.id !== tourId));
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to delete tour:', err);
    }
  }

  toggleFavorite(tourId: string): void {
    console.log('Toggle favorite:', tourId);
  }

  getPopularity(tour: Tour): number { return this.tourService.getPopularity(tour); }
  getAverageRating(tour: Tour): number { return this.tourService.getAverageRating(tour); }
  getRatingStars(rating: number) { return this.tourService.getRatingStars(rating); }
  getAverageActualTime(tour: Tour): string { return this.tourService.getAverageActualTime(tour); }
  getChildFriendliness(tour: Tour): number { return this.tourService.getChildFriendliness(tour); }
  getChildFriendlinessEmoji(score: number): string { return this.tourService.getChildFriendlinessEmoji(score); }

  goToSettings(): void { this.router.navigate(['/settings']); }

  goToProfile(): void {
    this.router.navigate([this.isLoggedIn() ? '/account' : '/login']);
  }

  navigateToHome(): void { this.router.navigate(['/']); }
}
