import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tour, TourLog } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-tour-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourDetailsComponent implements OnInit, OnDestroy {
  private tourService = inject(TourService);
  private toastService = inject(ToastService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  tour = signal<Tour | null>(null);
  tourId = signal<string | null>(null);
  isNewTour = signal(false);
  isEditing = signal(false);
  showLogForm = signal(false);
  isLoading = signal(false);
  saveMessage = signal('');
  errorMessage = signal('');
  editingLogId = signal<string | null>(null);
  
  private destroy$ = new Subject<void>();
  private saveMessageTimeout: ReturnType<typeof setTimeout> | undefined;
  private logMessageTimeout: ReturnType<typeof setTimeout> | undefined;

  tourForm: {
    name: string;
    selectedImage: string;
    description: string;
    from: string;
    to: string;
    transportType: 'hiking' | 'cycling' | 'running' | 'walking' | '';
    distance: string;
    time: string;
  } = {
    name: '',
    selectedImage: '',
    description: '',
    from: '',
    to: '',
    transportType: 'hiking',
    distance: '0',
    time: ''
  };

  newLog: {
    date: string;
    startTime: string;
    endTime: string;
    actualDistance: number;
    difficulty: number;
    rating: number;
    notes: string;
  } = {
    date: '',
    startTime: '',
    endTime: '',
    actualDistance: 0,
    difficulty: 5,
    rating: 2.5,
    notes: ''
  };

  transportTypes = ['hiking', 'cycling', 'running', 'walking'];

  private getCurrentIsoDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.newLog.date = this.getCurrentIsoDate();

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.tourId.set(params['id']);

        if (this.tourId() === 'new') {
          this.isNewTour.set(true);
          this.isEditing.set(true);
          this.initializeNewTour();
        } else {
          this.loadTour();

          this.activatedRoute.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(q => {
              this.isEditing.set(q['edit'] === 'true');
            });
        }
      });
  }

  ngOnDestroy(): void {
    if (this.saveMessageTimeout) {
      clearTimeout(this.saveMessageTimeout);
    }
    if (this.logMessageTimeout) {
      clearTimeout(this.logMessageTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeNewTour(): void {
    this.tour.set({
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
    });
    this.populateFormFromTour();
  }

  loadTour(): void {
    this.isLoading.set(true);
    const id = this.tourId();
    if (!id) return;

    const foundTour = this.tourService.getTourById(id);
    
    if (!foundTour && id === '1') {
      this.tour.set({
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
      });
    } else {
      this.tour.set(foundTour || null);
    }

    if (this.tour()) {
      this.populateFormFromTour();
    }
    this.isLoading.set(false);
  }

  populateFormFromTour(): void {
    const currentTour = this.tour();
    if (!currentTour) return;
    
    this.tourForm = {
      name: currentTour.name,
      selectedImage: currentTour.selectedImage,
      description: currentTour.description,
      from: currentTour.from,
      to: currentTour.to,
      distance: currentTour.distance,
      time: currentTour.time,
      transportType: currentTour.transportType
    };
  }

  saveTour(): void {
    this.errorMessage.set('');
    this.saveMessage.set('');

    if (this.saveMessageTimeout) {
      clearTimeout(this.saveMessageTimeout);
    }

    const validationError = this.tourService.validateTourForm(this.tourForm);
    if (validationError) {
      this.toastService.show(validationError, true);
      return;
    }

    const currentTour = this.tour();
    if (!currentTour) return;

    const updates: Partial<Tour> = {
      name: this.tourForm.name.trim(),
      selectedImage: this.tourForm.selectedImage,
      description: this.tourForm.description,
      from: this.tourForm.from.trim(),
      to: this.tourForm.to.trim(),
      distance: this.tourForm.distance,
      time: this.tourForm.time,
      transportType: this.tourForm.transportType
    };

    if (this.isNewTour()) {
      const newTour = this.tourService.addTour({
        ...currentTour,
        ...updates,
        logs: []
      });
      this.tour.set(newTour);
      this.tourId.set(newTour.id);
      this.isNewTour.set(false);
    } else {
      this.tourService.updateTour(currentTour.id, updates);
      this.tour.set({ ...currentTour, ...updates });
    }

    this.isEditing.set(false);
    this.toastService.show('Tour saved successfully!', false);
    this.saveMessageTimeout = setTimeout(() => {
      this.saveMessage.set('');
    }, 3000);
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.saveTour();
    } else {
      this.isEditing.set(true);
    }
  }

  cancel(): void {
    this.errorMessage.set('');
    this.saveMessage.set('');
    if (this.isNewTour()) {
      this.router.navigate(['/']);
    } else {
      this.isEditing.set(false);
      this.populateFormFromTour();
    }
  }

  selectImage(img: string): void {
    this.tourForm.selectedImage = img;
  }

  addLog(): void {
    const validationError = this.tourService.validateLogForm({
      ...this.newLog,
      date: new Date(this.newLog.date)
    });
    if (validationError) {
      this.toastService.show(validationError, true);
      return;
    }

    const currentTour = this.tour();
    if (!currentTour) {
      this.toastService.show('Tour not found', true);
      return;
    }

    const totalTime = this.tourService.calculateDuration(this.newLog.startTime, this.newLog.endTime);
    
    const newLog = this.tourService.addTourLog(currentTour.id, {
      date: new Date(this.newLog.date),
      startTime: this.newLog.startTime,
      endTime: this.newLog.endTime,
      actualDistance: this.newLog.actualDistance,
      difficulty: this.newLog.difficulty,
      totalTime,
      rating: this.newLog.rating,
      notes: this.newLog.notes
    });

    if (newLog) {
      const updatedTour = this.tourService.getTourById(currentTour.id);
      this.tour.set(updatedTour || currentTour);
      this.resetLogForm();
      this.toastService.show('Log entry added successfully!', false);

      if (this.logMessageTimeout) {
        clearTimeout(this.logMessageTimeout);
      }
      this.logMessageTimeout = setTimeout(() => {
        this.saveMessage.set('');
      }, 3000);
    }
  }

  deleteLog(logId: string): void {
    if (!confirm('Are you sure you want to delete this log entry? This action cannot be undone.')) {
      return;
    }
    
    const currentTour = this.tour();
    if (!currentTour) return;

    const success = this.tourService.deleteTourLog(currentTour.id, logId);
    if (success) {
      const updatedTour = this.tourService.getTourById(currentTour.id);
      this.tour.set(updatedTour || currentTour);
    }
  }

  editLog(logId: string): void {
    const logToEdit = this.tour()?.logs.find(l => l.id === logId);
    if (!logToEdit) return;

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
      rating: logToEdit.rating,
      notes: logToEdit.notes
    };

    this.editingLogId.set(logId);
    this.showLogForm.set(true);
  }

  saveLogEdit(): void {
    const validationError = this.tourService.validateLogForm({
      ...this.newLog,
      date: new Date(this.newLog.date)
    });
    if (validationError) {
      this.toastService.show(validationError, true);
      return;
    }

    const currentTour = this.tour();
    const logId = this.editingLogId();
    if (!currentTour || !logId) {
      this.toastService.show('Tour or log not found', true);
      return;
    }

    const totalTime = this.tourService.calculateDuration(this.newLog.startTime, this.newLog.endTime);
    
    const success = this.tourService.updateTourLog(currentTour.id, logId, {
      date: new Date(this.newLog.date),
      startTime: this.newLog.startTime,
      endTime: this.newLog.endTime,
      actualDistance: this.newLog.actualDistance,
      difficulty: this.newLog.difficulty,
      totalTime,
      rating: this.newLog.rating,
      notes: this.newLog.notes
    });

    if (success) {
      const updatedTour = this.tourService.getTourById(currentTour.id);
      this.tour.set(updatedTour || currentTour);
      this.cancelLogEdit();
      this.toastService.show('Log entry updated successfully!', false);

      if (this.logMessageTimeout) {
        clearTimeout(this.logMessageTimeout);
      }
      this.logMessageTimeout = setTimeout(() => {
        this.saveMessage.set('');
      }, 3000);
    }
  }

  cancelLogEdit(): void {
    this.editingLogId.set(null);
    this.resetLogForm();
  }

  private resetLogForm(): void {
    this.newLog = {
      date: this.getCurrentIsoDate(),
      startTime: '',
      endTime: '',
      actualDistance: 0,
      difficulty: 5,
      rating: 2.5,
      notes: ''
    };
    this.showLogForm.set(false);
    this.errorMessage.set('');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getAverageRating(tour: Tour): number {
    return this.tourService.getAverageRating(tour);
  }

  getAverageActualTime(tour: Tour): string {
    return this.tourService.getAverageActualTime(tour);
  }

  getRatingStars(rating: number): { full: number; half: boolean; empty: number } {
    return this.tourService.getRatingStars(rating);
  }

  setRating(stars: number): void {
    this.newLog.rating = stars;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getPopularity(tour: Tour): number {
    return this.tourService.getPopularity(tour);
  }

  getChildFriendliness(tour: Tour): number {
    return this.tourService.getChildFriendliness(tour);
  }

  getChildFriendlinessLabel(score: number): string {
    return this.tourService.getChildFriendlinessLabel(score);
  }
}

