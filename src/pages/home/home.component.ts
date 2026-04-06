import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Tour } from '../../models/tour.model'

/**
 * Home Component
 * Main page of the TourTracker application with tour list and search functionality
 */

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tours: Tour[] = [
    // { id: '1', name: 'My first Route', description: '', from: 'FH Technikum', to: 'Mt. Everest', transportType: '', distance: '8300km', time: '60d', logs: [] },
    // { id: '2', name: 'Alpine Hike', description: '', from: 'Innsbruck', to: 'Zugspitze', transportType: '', distance: '45km', time: '12h', logs: [] },
    // { id: '3', name: 'City Tour', description: '', from: 'Vienna', to: 'Bratislava', transportType: '', distance: '65km', time: '2d', logs: [] },
    // { id: '4', name: 'Danube Bike Trail', description: '', from: 'Passau', to: 'Vienna', transportType: '', distance: '320km', time: '5d',logs: [] }
  ];

  searchQuery: string = '';
  filteredTours: Tour[] = this.tours;
  isLoggedIn = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isUserAuthenticated()();

    // Initialize dark mode from auth service
    this.authService.initializeDarkMode();

    this.tours = JSON.parse(sessionStorage.getItem('tours') || '[]');

    this.filteredTours = this.tours; // Remove this line if you want the template to be shown

  }

  onSearchInput(value: string): void {
    this.searchQuery = value.toLowerCase();
    this.filterTours();
  }

  filterTours(): void {
    if (!this.searchQuery.trim()) { // This means if searchQuery is empty
      this.filteredTours = this.tours;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredTours = this.tours.filter(tour => {
        // Search in basic tour fields
        const basicMatch =
          tour.name.toLowerCase().includes(query) ||
          tour.from.toLowerCase().includes(query) ||
          tour.to.toLowerCase().includes(query) ||
          tour.description.toLowerCase().includes(query);

        // Search in logs
        const logsMatch = tour.logs.some(log =>
          log.notes.toLowerCase().includes(query) ||
          log.difficulty.toString().includes(query)
        );

        // Search by computed attributes (popularity/logs count)
        const popularityMatch =
          query.includes('popular') ||
          query.includes('log') ||
          query === this.getPopularity(tour).toString();

        // Search by child-friendliness level
        const childFriendlyMatch =
          (this.getChildFriendliness(tour).toString() === query) ||
          (query.includes('child') && this.getChildFriendliness(tour) >= 4) ||
          (query.includes('beginner') && this.getChildFriendliness(tour) >= 4) ||
          (query.includes('easy') && this.getChildFriendliness(tour) >= 3) ||
          (query.includes('hard') && this.getChildFriendliness(tour) <= 2) ||
          (query.includes('challenging') && this.getChildFriendliness(tour) <= 2);

        return basicMatch || logsMatch || popularityMatch || childFriendlyMatch;
      });
    }
  }

  addTour(): void {
    // Navigate to tour creation page
    this.router.navigate(['/tour', 'new']);
  }

  goToTour(id: string) {
    this.router.navigate(['/tour', id]);
  }

  editTour(tourId: string): void {
    // Navigate to tour details for editing
    this.router.navigate(['/tour', tourId], {
      queryParams: { edit: true }
    }).catch(err => {
      console.error('Navigation to tour edit failed:', err);
    });
  }

  deleteTour(tourId: string): void {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }

    // This removes it from the array (but that's only what's saved in the variable)
    this.tours = this.tours.filter(tour => tour.id !== tourId);

    // This makes it so the new array version is shown
    this.filterTours();

    // Also need to save it into session, otherwise it won't stay until next reload
    sessionStorage.setItem('tours', JSON.stringify(this.tours));
  }

  toggleFavorite(tourId: string): void {
    console.log('Toggle favorite:', tourId);
    // Add favorite functionality
  }

  getPopularity(tour: Tour): number {
    return tour.logs.length;
  }

  getChildFriendliness(tour: Tour): number {
    if (tour.logs.length === 0) return 3; // Default to neutral

    let score = 0;
    const avgDifficulty = tour.logs.reduce((sum, log) => sum + log.difficulty, 0) / tour.logs.length;
    const avgTimeMinutes = tour.logs.reduce((sum, log) => {
      const [h, m] = log.totalTime.split(':').map(Number);
      return sum + (h * 60 + m);
    }, 0) / tour.logs.length;
    const avgDistance = tour.logs.reduce((sum, log) => sum + log.actualDistance, 0) / tour.logs.length;

    if (avgDifficulty < 5) score += 2;
    if (avgTimeMinutes < 180) score += 2; // Less than 3 hours
    if (avgDistance < 15) score += 2;

    return Math.min(6, score);
  }

  getChildFriendlinessEmoji(score: number): string {
    if (score === 0) return '⚠️';
    if (score <= 2) return '🧗';
    if (score <= 4) return '🚶';
    return '👧';
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  goToProfile(): void {
    // If logged in, go to account page; otherwise go to login/register
    if (this.isLoggedIn) {
      this.router.navigate(['/account']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
