import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tour, TourLog } from '../../models/tour.model';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.scss']
})
export class TourDetailsComponent implements OnInit {
  // Tour data
  tour: Tour | null = null;
  tourId: string | null = null;
  isNewTour = false;
  isEditing = false;
  showLogForm = false;

  // Form data - properly typed to match Tour interface
  tourForm: {
    name: string;
    description: string;
    startPoint: string;
    endPoint: string;
    distance: number;
    estimatedTime: string;
    transportType: 'hiking' | 'cycling' | 'running' | 'walking';
    difficulty: number;
    elevationUp: number;
    elevationDown: number;
    childFriendly: boolean;
    rating: number;
    isFavorite: boolean;
  } = {
    name: '',
    description: '',
    startPoint: '',
    endPoint: '',
    distance: 0,
    estimatedTime: '',
    transportType: 'hiking',
    difficulty: 5,
    elevationUp: 0,
    elevationDown: 0,
    childFriendly: false,
    rating: 0,
    isFavorite: false
  };

  newLog: Partial<TourLog> = {
    date: new Date(),
    startTime: '',
    endTime: '',
    actualDistance: 0,
    difficulty: 5,
    notes: ''
  };

  transportTypes = ['hiking', 'cycling', 'running', 'walking'];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.tourId = params['id'];

      if (this.tourId === 'new') {
        this.isNewTour = true;
        this.isEditing = true;
        this.initializeNewTour();
      } else {
        this.loadTour();
      }
    });
  }

  initializeNewTour() {
    this.tour = {
      id: 'temp-' + Date.now(),
      name: '',
      description: '',
      startPoint: '',
      endPoint: '',
      distance: 0,
      estimatedTime: '',
      transportType: 'hiking',
      difficulty: 5,
      rating: 0,
      elevationUp: 0,
      elevationDown: 0,
      childFriendly: false,
      isFavorite: false,
      logs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.populateFormFromTour();
  }

  loadTour() {
    // In a real app, this would load from a service
    // For now, load from the home component's tour data
    const tours = JSON.parse(sessionStorage.getItem('tours') || '[]');
    this.tour = tours.find((t: Tour) => t.id === this.tourId) || null;

    if (!this.tour && this.tourId === '1') {
      // Mock data for tour 1
      this.tour = {
        id: '1',
        name: 'My first Route',
        description: 'A wonderful mountain tour',
        startPoint: 'FH Technikum',
        endPoint: 'Mt. Everest',
        distance: 8300,
        estimatedTime: '60d',
        transportType: 'hiking',
        difficulty: 8,
        rating: 3,
        elevationUp: 5000,
        elevationDown: 5000,
        childFriendly: false,
        isFavorite: true,
        logs: [
          {
            id: 'log1',
            tourId: '1',
            date: new Date('2025-10-12'),
            startTime: '12:15',
            endTime: '14:30',
            actualDistance: 6.7,
            difficulty: 8,
            totalTime: '2:15',
            rating: 3,
            notes: 'More difficult than usual, due to rainy weather'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    if (this.tour) {
      this.populateFormFromTour();
    }
  }

  populateFormFromTour() {
    if (!this.tour) return;
    this.tourForm = {
      name: this.tour.name,
      description: this.tour.description,
      startPoint: this.tour.startPoint,
      endPoint: this.tour.endPoint,
      distance: this.tour.distance,
      estimatedTime: this.tour.estimatedTime,
      transportType: this.tour.transportType,
      difficulty: this.tour.difficulty,
      elevationUp: this.tour.elevationUp,
      elevationDown: this.tour.elevationDown,
      childFriendly: this.tour.childFriendly,
      rating: this.tour.rating,
      isFavorite: this.tour.isFavorite
    };
  }

  saveTour() {
    if (!this.tour) return;

    // Update tour with form data
    this.tour.name = this.tourForm.name;
    this.tour.description = this.tourForm.description;
    this.tour.startPoint = this.tourForm.startPoint;
    this.tour.endPoint = this.tourForm.endPoint;
    this.tour.distance = this.tourForm.distance;
    this.tour.estimatedTime = this.tourForm.estimatedTime;
    this.tour.transportType = this.tourForm.transportType;
    this.tour.difficulty = this.tourForm.difficulty;
    this.tour.elevationUp = this.tourForm.elevationUp;
    this.tour.elevationDown = this.tourForm.elevationDown;
    this.tour.childFriendly = this.tourForm.childFriendly;
    this.tour.rating = this.tourForm.rating;
    this.tour.isFavorite = this.tourForm.isFavorite;
    this.tour.updatedAt = new Date();

    // Save to sessionStorage for now
    let tours = JSON.parse(sessionStorage.getItem('tours') || '[]');
    if (this.isNewTour) {
      this.tour.id = Date.now().toString();
      tours.push(this.tour);
    } else {
      tours = tours.map((t: Tour) => t.id === this.tour?.id ? this.tour : t);
    }
    sessionStorage.setItem('tours', JSON.stringify(tours));

    this.isEditing = false;
  }

  toggleEdit() {
    if (this.isEditing) {
      this.saveTour();
    } else {
      this.isEditing = true;
    }
  }

  cancel() {
    if (this.isNewTour) {
      this.router.navigate(['/']);
    } else {
      this.isEditing = false;
      this.populateFormFromTour();
    }
  }

  toggleFavorite() {
    if (this.tour) {
      this.tour.isFavorite = !this.tour.isFavorite;
      this.saveTour();
    }
  }

  addLog() {
    if (!this.tour || !this.newLog.date || !this.newLog.startTime || !this.newLog.endTime) {
      return;
    }

    const log: TourLog = {
      id: Date.now().toString(),
      tourId: this.tour.id,
      date: this.newLog.date as Date,
      startTime: this.newLog.startTime || '',
      endTime: this.newLog.endTime || '',
      actualDistance: this.newLog.actualDistance || 0,
      difficulty: this.newLog.difficulty || 5,
      totalTime: this.calculateDuration(this.newLog.startTime || '', this.newLog.endTime || ''),
      rating: this.newLog.rating || 0,
      notes: this.newLog.notes || ''
    };

    this.tour.logs.push(log);
    this.saveTour();
    this.resetLogForm();
  }

  deleteLog(logId: string) {
    if (this.tour) {
      this.tour.logs = this.tour.logs.filter(l => l.id !== logId);
      this.saveTour();
    }
  }

  private calculateDuration(start: string, end: string): string {
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const duration = Math.max(0, endMin - startMin);
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}:${String(minutes).padStart(2, '0')}`;
    } catch {
      return '0:00';
    }
  }

  private resetLogForm() {
    this.newLog = {
      date: new Date(),
      startTime: '',
      endTime: '',
      actualDistance: 0,
      difficulty: 5,
      notes: ''
    };
    this.showLogForm = false;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}


