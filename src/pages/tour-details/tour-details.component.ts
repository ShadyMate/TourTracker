import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tour, TourLog } from '../../models/tour.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.scss']
})
export class TourDetailsComponent implements OnInit, OnDestroy {
  // Tour data
  tour: Tour | null = null;
  tourId: string | null = null;
  isNewTour = false;
  isEditing = false;
  showLogForm = false;
  isLoading = false;
  saveMessage = '';
  errorMessage = '';
  editingLogId: string | null = null;
  private destroy$ = new Subject<void>();
  private saveMessageTimeout: ReturnType<typeof setTimeout> | undefined;
  private logMessageTimeout: ReturnType<typeof setTimeout> | undefined;

  // Form data - properly typed to match Tour interface
  tourForm: {
    name: string;
    selectedImage: string;
    description: string;
    from: string;
    to: string;
    transportType: 'hiking' | 'cycling' | 'running' | 'walking' | '';
    distance: string;
    time: string;
    // difficulty: number;
    // elevationUp: number;
    // elevationDown: number;
    // childFriendly: boolean;
    // rating: number;
    // isFavorite: boolean;
  } = {
    name: '',
    selectedImage: '',
    description: '',
    from: '',
    to: '',
    transportType: 'hiking',
    distance: '0',
    time: '',
    // difficulty: 5,
    // elevationUp: 0,
    // elevationDown: 0,
    // childFriendly: false,
    // rating: 0,
    // isFavorite: false
  };

  newLog: {
    date: string;
    startTime: string;
    endTime: string;
    actualDistance: number;
    difficulty: number;
    notes: string;
  } = {
    date: '',
    startTime: '',
    endTime: '',
    actualDistance: 0,
    difficulty: 5,
    notes: ''
  };

  transportTypes = ['hiking', 'cycling', 'running', 'walking'];

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  private getCurrentIsoDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.newLog.date = this.getCurrentIsoDate();

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.tourId = params['id'];

        if (this.tourId === 'new') {
          this.isNewTour = true;
          this.isEditing = true;
          this.initializeNewTour();
        } else {
          this.loadTour();

          this.activatedRoute.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(q => {
              this.isEditing = q['edit'] === 'true';
            });
        }
      });
  }

  ngOnDestroy() {
    // Clear any pending timeouts
    if (this.saveMessageTimeout) {
      clearTimeout(this.saveMessageTimeout);
    }
    if (this.logMessageTimeout) {
      clearTimeout(this.logMessageTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeNewTour() {
    this.tour = {
      id: 'temp-' + Date.now(),
      name: '',
      selectedImage: '',
      description: '',
      from: '',
      to: '',
      distance: '0',
      time: '',
      transportType: 'hiking',
      logs: []
    };
    this.populateFormFromTour();
  }

  loadTour() {
    this.isLoading = true;
    // In a real app, this would load from a service
    // For now, load from the home component's tour data
    const tours = JSON.parse(sessionStorage.getItem('tours') || '[]');
    this.tour = tours.find((t: Tour) => t.id === this.tourId) || null;

    if (!this.tour && this.tourId === '1') {
      // Mock data for tour 1
      this.tour = {
        id: '1',
        name: 'My first Route',
        selectedImage: '',
        description: 'A wonderful mountain tour',
        from: 'FH Technikum',
        to: 'Mt. Everest',
        distance: '8300',
        time: '60d',
        transportType: 'hiking',
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
        ]
      };
    }

    if (this.tour) {
      this.populateFormFromTour();
    }
    this.isLoading = false;
  }

  populateFormFromTour() {
    if (!this.tour) return;
    this.tourForm = {
      name: this.tour.name,
      selectedImage: this.tour.selectedImage,
      description: this.tour.description,
      from: this.tour.from,
      to: this.tour.to,
      distance: this.tour.distance,
      time: this.tour.time,
      transportType: this.tour.transportType,
      // difficulty: this.tour.difficulty,
      // elevationUp: this.tour.elevationUp,
      // elevationDown: this.tour.elevationDown,
      // childFriendly: this.tour.childFriendly,
      // rating: this.tour.rating,
      // isFavorite: this.tour.isFavorite
    };
  }

  saveTour() {
    // Clear previous messages
    this.errorMessage = '';
    this.saveMessage = '';

    // Clear any pending save message timeout
    if (this.saveMessageTimeout) {
      clearTimeout(this.saveMessageTimeout);
    }

    // Validate all required fields
    if (!this.tourForm.name.trim()) {
      this.errorMessage = 'Tour name is required';
      return;
    }

    if (!this.tourForm.from.trim()) {
      this.errorMessage = 'Starting point is required';
      return;
    }

    if (!this.tourForm.to.trim()) {
      this.errorMessage = 'Destination is required';
      return;
    }

    if (!this.tour) return;

    // Update tour with form data
    this.tour.name = this.tourForm.name.trim();
    this.tour.selectedImage = this.tourForm.selectedImage;
    this.tour.description = this.tourForm.description;
    this.tour.from = this.tourForm.from.trim();
    this.tour.to = this.tourForm.to.trim();
    this.tour.distance = this.tourForm.distance;
    this.tour.time = this.tourForm.time;
    this.tour.transportType = this.tourForm.transportType;

    // Save to sessionStorage for now
    let tours = JSON.parse(sessionStorage.getItem('tours') || '[]');
    if (this.isNewTour) {
      tours.push(this.tour);
      this.isNewTour = false;
    } else {
      tours = tours.map((t: Tour) => t.id === this.tour?.id ? this.tour : t);
    }
    sessionStorage.setItem('tours', JSON.stringify(tours));

    this.isEditing = false;
    this.saveMessage = 'Tour saved successfully!';
    // Clear success message after 3 seconds
    this.saveMessageTimeout = setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  toggleEdit() {
    if (this.isEditing) {
      this.saveTour();
    } else {
      this.isEditing = true;
    }
  }

  cancel() {
    this.errorMessage = '';
    this.saveMessage = '';
    if (this.isNewTour) {
      this.router.navigate(['/']);
    } else {
      this.isEditing = false;
      this.populateFormFromTour();
    }
  }

  selectImage(img: string) {
    this.tourForm.selectedImage = img;
  }

  // toggleFavorite() {
  //   if (this.tour) {
  //     this.tour.isFavorite = !this.tour.isFavorite;
  //     this.saveTour();
  //   }
  // }

  addLog() {
    // Validate required fields
    if (!this.newLog.date || !this.newLog.startTime || !this.newLog.endTime) {
      this.errorMessage = 'Date, start time, and end time are required';
      return;
    }

    if (this.newLog.actualDistance <= 0) {
      this.errorMessage = 'Actual distance must be greater than 0';
      return;
    }

    if (this.newLog.difficulty < 1 || this.newLog.difficulty > 10) {
      this.errorMessage = 'Difficulty must be between 1-10';
      return;
    }

    // Validate end time is after start time
    const [startH, startM] = this.newLog.startTime.split(':').map(Number);
    const [endH, endM] = this.newLog.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      this.errorMessage = 'End time must be after start time';
      return;
    }

    if (!this.tour) {
      this.errorMessage = 'Tour not found';
      return;
    }

    const log: TourLog = {
      id: Date.now().toString(),
      tourId: this.tour.id,
      date: new Date(this.newLog.date),
      startTime: this.newLog.startTime || '',
      endTime: this.newLog.endTime || '',
      actualDistance: this.newLog.actualDistance || 0,
      difficulty: this.newLog.difficulty || 5,
      totalTime: this.calculateDuration(this.newLog.startTime || '', this.newLog.endTime || ''),
      rating: 0,
      notes: this.newLog.notes || ''
    };

    this.tour.logs.push(log);
    this.saveTour();
    this.resetLogForm();
    this.saveMessage = 'Log entry added successfully!';

    // Clear any pending log message timeout
    if (this.logMessageTimeout) {
      clearTimeout(this.logMessageTimeout);
    }
    this.logMessageTimeout = setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  deleteLog(logId: string) {
    if (!confirm('Are you sure you want to delete this log entry? This action cannot be undone.')) {
      return;
    }
    if (this.tour) {
      this.tour.logs = this.tour.logs.filter(l => l.id !== logId);
      this.saveTour();
    }
  }

  editLog(logId: string) {
    const logToEdit = this.tour?.logs.find(l => l.id === logId);
    if (!logToEdit) return;

    // Pre-populate form with log data
    let dateStr = '';
    if (logToEdit.date instanceof Date) {
      dateStr = logToEdit.date.toISOString().split('T')[0];
    } else if (typeof logToEdit.date === 'string') {
      dateStr = (logToEdit.date as string).split('T')[0];
    } else {
      dateStr = new Date(logToEdit.date as any).toISOString().split('T')[0];
    }

    this.newLog = {
      date: dateStr,
      startTime: logToEdit.startTime,
      endTime: logToEdit.endTime,
      actualDistance: logToEdit.actualDistance,
      difficulty: logToEdit.difficulty,
      notes: logToEdit.notes
    };

    this.editingLogId = logId;
    this.showLogForm = true;
  }

  saveLogEdit() {
    // Validate required fields
    if (!this.newLog.date || !this.newLog.startTime || !this.newLog.endTime) {
      this.errorMessage = 'Date, start time, and end time are required';
      return;
    }

    if (this.newLog.actualDistance <= 0) {
      this.errorMessage = 'Actual distance must be greater than 0';
      return;
    }

    if (this.newLog.difficulty < 1 || this.newLog.difficulty > 10) {
      this.errorMessage = 'Difficulty must be between 1-10';
      return;
    }

    // Validate end time is after start time
    const [startH, startM] = this.newLog.startTime.split(':').map(Number);
    const [endH, endM] = this.newLog.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      this.errorMessage = 'End time must be after start time';
      return;
    }

    if (!this.tour) {
      this.errorMessage = 'Tour not found';
      return;
    }

    // Find and update the log
    const logIndex = this.tour.logs.findIndex(l => l.id === this.editingLogId);
    if (logIndex === -1) {
      this.errorMessage = 'Log entry not found';
      return;
    }

    const updatedLog: TourLog = {
      id: this.editingLogId!,
      tourId: this.tour.id,
      date: new Date(this.newLog.date),
      startTime: this.newLog.startTime,
      endTime: this.newLog.endTime,
      actualDistance: this.newLog.actualDistance,
      difficulty: this.newLog.difficulty,
      totalTime: this.calculateDuration(this.newLog.startTime, this.newLog.endTime),
      rating: this.tour.logs[logIndex].rating,
      notes: this.newLog.notes
    };

    this.tour.logs[logIndex] = updatedLog;
    this.saveTour();
    this.cancelLogEdit();
    this.saveMessage = 'Log entry updated successfully!';

    // Clear any pending log message timeout
    if (this.logMessageTimeout) {
      clearTimeout(this.logMessageTimeout);
    }
    this.logMessageTimeout = setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  cancelLogEdit() {
    this.editingLogId = null;
    this.resetLogForm();
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
      date: this.getCurrentIsoDate(),
      startTime: '',
      endTime: '',
      actualDistance: 0,
      difficulty: 5,
      notes: ''
    };
    this.showLogForm = false;
    this.errorMessage = '';
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

  getChildFriendlinessLabel(score: number): string {
    if (score === 0) return 'Not suitable';
    if (score <= 2) return 'Challenging';
    if (score <= 4) return 'Moderate';
    return 'Very friendly';
  }
}


