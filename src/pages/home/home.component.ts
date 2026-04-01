import { Component, OnInit } from '@angular/core';
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
    { id: '1', name: 'My first Route', description: '', from: 'FH Technikum', to: 'Mt. Everest', transportType: '', distance: '8300km', time: '60d', logs: [] },
    { id: '2', name: 'Alpine Hike', description: '', from: 'Innsbruck', to: 'Zugspitze', transportType: '', distance: '45km', time: '12h', logs: [] },
    { id: '3', name: 'City Tour', description: '', from: 'Vienna', to: 'Bratislava', transportType: '', distance: '65km', time: '2d', logs: [] },
    { id: '4', name: 'Danube Bike Trail', description: '', from: 'Passau', to: 'Vienna', transportType: '', distance: '320km', time: '5d',logs: [] }
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

  goToTour(id: string) {
    this.router.navigate(['/tour', id]);
  }

  editTour(tourId: string): void {
    console.log('EDIT CLICKED', tourId);

    // Navigate to tour details for editing
    this.router.navigate(['/tour', tourId], {
      queryParams: { edit: true }
    }).then(() => {
      console.log('NAVIGATION DONE');
    })
  }

  deleteTour(tourId: string): void {
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
