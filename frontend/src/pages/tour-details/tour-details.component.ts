import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tour, TourLog } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';
import { TourMapComponent } from './tour-map.component';
import { LocationAutocompleteComponent, LocationSuggestion } from '../../components/location-autocomplete/location-autocomplete.component';

@Component({
  selector: 'app-tour-details',
  imports: [CommonModule, FormsModule, TourMapComponent, LocationAutocompleteComponent],
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourDetailsComponent implements OnInit, OnDestroy {
  private tourService = inject(TourService);
  private toastService = inject(ToastService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

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
    fromCoords?: [number, number];
    toCoords?: [number, number];
    transportType: 'hiking' | 'cycling' | 'walking' | '';
    distance: string;
    time: string;
  } = {
    name: '',
    selectedImage: '',
    description: '',
    from: '',
    to: '',
    fromCoords: undefined,
    toCoords: undefined,
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

  transportTypes = ['hiking', 'cycling', 'walking'];

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
              this.cdr.markForCheck();
            });
        }
      });
  }

  ngOnDestroy(): void {
    clearTimeout(this.saveMessageTimeout);
    clearTimeout(this.logMessageTimeout);
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
      childFriendly: false,
      logs: []
    });
    this.populateFormFromTour();
    this.cdr.markForCheck();
  }

  async loadTour(): Promise<void> {
    this.isLoading.set(true);
    this.cdr.markForCheck();
    const id = this.tourId();
    if (!id) return;

    try {
      const found = await this.tourService.getTourById(id);
      this.tour.set(found);
      if (found) this.populateFormFromTour();
    } catch (err) {
      console.error('Failed to load tour:', err);
      this.tour.set(null);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  populateFormFromTour(): void {
    const t = this.tour();
    if (!t) return;
    this.tourForm = {
      name: t.name,
      selectedImage: t.selectedImage,
      description: t.description,
      from: t.from,
      to: t.to,
      fromCoords: t.fromCoords,
      toCoords: t.toCoords,
      distance: t.distance,
      time: t.time,
      transportType: t.transportType
    };
  }

  async saveTour(): Promise<void> {
    this.errorMessage.set('');
    this.saveMessage.set('');
    clearTimeout(this.saveMessageTimeout);

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
      fromCoords: this.tourForm.fromCoords,
      toCoords: this.tourForm.toCoords,
      distance: this.tourForm.distance,
      time: this.tourForm.time,
      transportType: this.tourForm.transportType,
      routeGeometry: currentTour.routeGeometry
    };

    try {
      if (this.isNewTour()) {
        const newTour = await this.tourService.addTour({
          ...currentTour,
          ...updates,
          logs: []
        });
        this.tour.set(newTour);
        this.tourId.set(newTour.id);
        this.isNewTour.set(false);
      } else {
        const updated = await this.tourService.updateTour(currentTour.id, updates);
        this.tour.set(updated);
      }

      this.isEditing.set(false);
      this.toastService.show('Tour saved successfully!', false);
      this.saveMessageTimeout = setTimeout(() => {
        this.saveMessage.set('');
        this.cdr.markForCheck();
      }, 3000);
    } catch (err) {
      console.error('Failed to save tour:', err);
      this.toastService.show('Failed to save tour. Please try again.', true);
    }
    this.cdr.markForCheck();
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

  async addLog(): Promise<void> {
    const validationError = this.tourService.validateLogForm({
      ...this.newLog,
      date: new Date(this.newLog.date)
    });
    if (validationError) {
      this.toastService.show(validationError, true);
      return;
    }

    const currentTour = this.tour();
    if (!currentTour) { this.toastService.show('Tour not found', true); return; }

    const totalTime = this.tourService.calculateDuration(this.newLog.startTime, this.newLog.endTime);

    try {
      await this.tourService.addTourLog(currentTour.id, {
        date: new Date(this.newLog.date),
        startTime: this.newLog.startTime,
        endTime: this.newLog.endTime,
        actualDistance: this.newLog.actualDistance,
        difficulty: this.newLog.difficulty,
        totalTime,
        rating: this.newLog.rating,
        notes: this.newLog.notes
      });
      // Reload tour to get updated logs from backend
      const updated = await this.tourService.getTourById(currentTour.id);
      this.tour.set(updated);
      this.resetLogForm();
      this.toastService.show('Log entry added successfully!', false);
    } catch (err) {
      console.error('Failed to add log:', err);
      this.toastService.show('Failed to add log entry.', true);
    }
    this.cdr.markForCheck();
  }

  async deleteLog(logId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this log entry? This action cannot be undone.')) {
      return;
    }
    const currentTour = this.tour();
    if (!currentTour) return;

    try {
      await this.tourService.deleteTourLog(currentTour.id, logId);
      const updated = await this.tourService.getTourById(currentTour.id);
      this.tour.set(updated);
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Failed to delete log:', err);
      this.toastService.show('Failed to delete log entry.', true);
    }
  }

  editLog(logId: string): void {
    const logToEdit = this.tour()?.logs.find(l => l.id === logId);
    if (!logToEdit) return;

    let dateStr = '';
    if (logToEdit.date instanceof Date) {
      dateStr = logToEdit.date.toISOString().split('T')[0];
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

  async saveLogEdit(): Promise<void> {
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
    if (!currentTour || !logId) { this.toastService.show('Tour or log not found', true); return; }

    const totalTime = this.tourService.calculateDuration(this.newLog.startTime, this.newLog.endTime);

    try {
      await this.tourService.updateTourLog(currentTour.id, logId, {
        date: new Date(this.newLog.date),
        startTime: this.newLog.startTime,
        endTime: this.newLog.endTime,
        actualDistance: this.newLog.actualDistance,
        difficulty: this.newLog.difficulty,
        totalTime,
        rating: this.newLog.rating,
        notes: this.newLog.notes
      });
      const updated = await this.tourService.getTourById(currentTour.id);
      this.tour.set(updated);
      this.cancelLogEdit();
      this.toastService.show('Log entry updated successfully!', false);
    } catch (err) {
      console.error('Failed to update log:', err);
      this.toastService.show('Failed to update log entry.', true);
    }
    this.cdr.markForCheck();
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

  // ── Location autocomplete handlers ────────────────────────────────────────

  onFromLocationSelected(suggestion: LocationSuggestion): void {
    this.tourForm.from = suggestion.label;
    this.tourForm.fromCoords = suggestion.coords;
    this.syncTourToMap();
  }

  onToLocationSelected(suggestion: LocationSuggestion): void {
    this.tourForm.to = suggestion.label;
    this.tourForm.toCoords = suggestion.coords;
    this.syncTourToMap();
  }

  onFromTextChange(text: string): void {
    this.tourForm.from = text;
    this.tourForm.fromCoords = undefined;
  }

  onToTextChange(text: string): void {
    this.tourForm.to = text;
    this.tourForm.toCoords = undefined;
  }

  onTransportTypeChange(): void {
    this.syncTourToMap();
  }

  onRouteLoaded(event: { coordinates: [number, number][]; distance: number; duration: number }): void {
    const current = this.tour();
    if (!current) return;
    const h = Math.floor(event.duration / 60);
    const m = Math.round(event.duration % 60);
    const timeStr = h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
    this.tourForm.distance = event.distance.toFixed(1);
    this.tourForm.time = timeStr;
    this.tour.set({ ...current, routeGeometry: event.coordinates, distance: this.tourForm.distance, time: timeStr });
    this.cdr.markForCheck();
  }

  private syncTourToMap(): void {
    const current = this.tour();
    if (!current) return;
    this.tour.set({
      ...current,
      from: this.tourForm.from,
      to: this.tourForm.to,
      fromCoords: this.tourForm.fromCoords,
      toCoords: this.tourForm.toCoords,
      transportType: this.tourForm.transportType || 'hiking',
      routeGeometry: undefined  // locations changed — force ORS re-fetch
    });
    this.cdr.markForCheck();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goBack(): void { this.router.navigate(['/']); }

  // ── Computed display helpers ──────────────────────────────────────────────

  getAverageRating(tour: Tour): number { return this.tourService.getAverageRating(tour); }
  getAverageActualTime(tour: Tour): string { return this.tourService.getAverageActualTime(tour); }
  getRatingStars(rating: number) { return this.tourService.getRatingStars(rating); }
  setRating(stars: number): void { this.newLog.rating = stars; }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }

  getPopularity(tour: Tour): number { return this.tourService.getPopularity(tour); }
  getChildFriendliness(tour: Tour): number { return this.tourService.getChildFriendliness(tour); }
  getChildFriendlinessLabel(score: number): string { return this.tourService.getChildFriendlinessLabel(score); }
}
