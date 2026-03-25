import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Home Component
 * Main page of the TourTracker application with tour list and search functionality
 */
interface Tour {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: string;
  time: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tours: Tour[] = [
    { id: '1', name: 'My first Route', from: 'FH Technikum', to: 'Mt. Everest', distance: '8300km', time: '60d' },
    { id: '2', name: 'Alpine Hike', from: 'Innsbruck', to: 'Zugspitze', distance: '45km', time: '12h' },
    { id: '3', name: 'City Tour', from: 'Vienna', to: 'Bratislava', distance: '65km', time: '2d' },
    { id: '4', name: 'Danube Bike Trail', from: 'Passau', to: 'Vienna', distance: '320km', time: '5d' }
  ];

  searchQuery: string = '';
  filteredTours: Tour[] = this.tours;
  isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isUserAuthenticated()();
  }

  ngOnInit() {
    // Initialize dark mode from auth service
    this.authService.initializeDarkMode();

    // Save tours to sessionStorage for tour details page
    sessionStorage.setItem('tours', JSON.stringify(this.tours));
  }

  onSearchInput(value: string): void {
    this.searchQuery = value.toLowerCase();
    this.filterTours();
  }

  filterTours(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTours = this.tours;
    } else {
      this.filteredTours = this.tours.filter(tour =>
        tour.name.toLowerCase().includes(this.searchQuery) ||
        tour.from.toLowerCase().includes(this.searchQuery) ||
        tour.to.toLowerCase().includes(this.searchQuery)
      );
    }
  }

  addTour(): void {
    // Navigate to tour creation page
    this.router.navigate(['/tour', 'new']);
  }

  editTour(tourId: string): void {
    // Navigate to tour details for editing
    this.router.navigate(['/tour', tourId]);
  }

  deleteTour(tourId: string): void {
    this.tours = this.tours.filter(tour => tour.id !== tourId);
    this.filterTours();
  }

  toggleFavorite(tourId: string): void {
    console.log('Toggle favorite:', tourId);
    // Add favorite functionality
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
