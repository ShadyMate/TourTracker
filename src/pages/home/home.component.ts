import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
export class HomeComponent {
  tours: Tour[] = [
    { id: '1', name: 'My first Route', from: 'FH Technikum', to: 'Mt. Everest', distance: '8300km', time: '60d' },
    { id: '2', name: 'Alpine Hike', from: 'Innsbruck', to: 'Zugspitze', distance: '45km', time: '12h' },
    { id: '3', name: 'City Tour', from: 'Vienna', to: 'Bratislava', distance: '65km', time: '2d' },
    { id: '4', name: 'Danube Bike Trail', from: 'Passau', to: 'Vienna', distance: '320km', time: '5d' }
  ];

  searchQuery: string = '';
  filteredTours: Tour[] = this.tours;

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
    if (this.searchQuery.trim()) {
      const newTour: Tour = {
        id: Date.now().toString(),
        name: this.searchQuery,
        from: '',
        to: '',
        distance: '',
        time: ''
      };
      this.tours.unshift(newTour);
      this.searchQuery = '';
      this.filteredTours = this.tours;
    }
  }

  editTour(tourId: string): void {
    console.log('Edit tour:', tourId);
    // Navigate to tour details or edit mode
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
    // Will navigate to settings page
  }

  goToProfile(): void {
    // Will navigate to profile page
  }
}