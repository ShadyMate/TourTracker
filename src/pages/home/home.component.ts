import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private tourService = inject(TourService);
  private router = inject(Router);

  searchQuery = signal('');
  
  tours = this.tourService.getTours();
  
  filteredTours = computed(() => 
    this.tourService.filterTours(this.tours(), this.searchQuery())
  );
  
  isLoggedIn = computed(() => this.authService.isUserAuthenticated()());

  ngOnInit(): void {
    // No initialization needed - services handle state
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value.toLowerCase());
  }

  addTour(): void {
    this.router.navigate(['/tour', 'new']);
  }

  goToTour(id: string): void {
    this.router.navigate(['/tour', id]);
  }

  editTour(tourId: string): void {
    this.router.navigate(['/tour', tourId], {
      queryParams: { edit: true }
    }).catch(err => {
      console.error('Navigation to tour edit failed:', err);
    });
  }

  deleteTour(tourId: string): void {
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }
    this.tourService.deleteTour(tourId);
  }

  toggleFavorite(tourId: string): void {
    console.log('Toggle favorite:', tourId);
  }

  getPopularity(tour: Tour): number {
    return this.tourService.getPopularity(tour);
  }

  getChildFriendliness(tour: Tour): number {
    return this.tourService.getChildFriendliness(tour);
  }

  getChildFriendlinessEmoji(score: number): string {
    return this.tourService.getChildFriendlinessEmoji(score);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  goToProfile(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/account']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
