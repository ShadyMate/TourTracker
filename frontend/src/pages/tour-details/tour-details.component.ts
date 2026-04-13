/**
 * TourDetailsComponent - ViewModel + View Layer
 *
 * MVVM Role: Central component for viewing and editing tour details
 * This component demonstrates advanced MVVM patterns:
 * - Two modes: VIEW (display tour info) and EDIT (form editing)
 * - Two-way binding [(ngModel)] syncs form inputs with component state
 * - Signal-based state management for reactive UI updates
 * - Nested data editing (tour logs within tour)
 * - Form validation before persistence
 *
 * Key Responsibilities:
 * 1. Load tour from URL parameter (route.params)
 * 2. Initialize empty form for new tours (/tour/new)
 * 3. Manage edit mode toggle (view ↔ edit)
 * 4. Handle tour log CRUD operations within tour
 * 5. Validate all user input before saving
 * 6. Persist to service when valid
 * 7. Show toast notifications for user feedback
 *
 * Data Flow for Tour Editing:
 * ┌────────────────────────────────────────────────────┐
 * │ User Views /tour/123 page                           │
 * │  ↓                                                   │
 * │ Route params detected, tourId loaded                │
 * │  ↓                                                   │
 * │ Component loads tour from service                   │
 * │  ↓                                                   │
 * │ populateFormFromTour() copies tour into form        │
 * │  ↓                                                   │
 * │ User clicks Edit button                             │
 * │  ↓                                                   │
 * │ isEditing.set(true) → template shows form fields    │
 * │  ↓                                                   │
 * │ User modifies fields via [(ngModel)] two-way binding│
 * │  ↓                                                   │
 * │ Changes stored in tourForm object in real-time      │
 * │  ↓                                                   │
 * │ User clicks Save                                    │
 * │  ↓                                                   │
 * │ saveTour() validates form via service               │
 * │  ↓                                                   │
 * │ If valid: service.updateTour() updates data         │
 * │ If invalid: toast notification shows error          │
 * │  ↓                                                   │
 * │ isEditing.set(false) → template shows view mode     │
 * │  ↓                                                   │
 * │ Toast notification shows success                    │
 * └────────────────────────────────────────────────────┘
 */
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

  // ═══════════════════════════════════════════════════════════════
  // VIEWMODEL STATE: Reactive signals for template binding
  // ═══════════════════════════════════════════════════════════════

  // Current tour being viewed/edited (loaded from service)
  tour = signal<Tour | null>(null);
  // Tour ID from URL parameter
  tourId = signal<string | null>(null);
  // Flags for conditional rendering in template
  isNewTour = signal(false); // True if /tour/new (creating tour)
  isEditing = signal(false); // True if in edit mode (form visible)
  showLogForm = signal(false); // True if log form visible
  isLoading = signal(false); // True while loading tour data
  saveMessage = signal(''); // Success message to display
  errorMessage = signal(''); // Error message to display
  editingLogId = signal<string | null>(null); // Which log is being edited
  
  private destroy$ = new Subject<void>();
  private saveMessageTimeout: ReturnType<typeof setTimeout> | undefined;
  private logMessageTimeout: ReturnType<typeof setTimeout> | undefined;

  // ═══════════════════════════════════════════════════════════════
  // FORM STATE: Staging areas for user input
  // These objects are NOT the source of truth - they stage changes
  // until user clicks Save, then are persisted to service
  // ═══════════════════════════════════════════════════════════════

  /**
   * Tour form object: captures user edits before saving
   * Two-way binding [(ngModel)]="tourForm.name" keeps this in sync with inputs
   * When user clicks Save, this data is validated and sent to service
   * When user clicks Cancel, original tour data is reloaded via populateFormFromTour()
   */
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

  /**
   * Log form object: captures new/edited log entry before saving
   * Used for both creating new logs and editing existing ones
   * When editing: editLog(logId) loads log data into this object
   * When creating: newLog remains as default values
   */
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

  // Available transport options for dropdown
  transportTypes = ['hiking', 'cycling', 'running', 'walking'];

  private getCurrentIsoDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * LIFECYCLE: Component initialization
   * 1. Sets current date for log form
   * 2. Subscribes to route params to detect tour ID
   * 3. Detects if creating new tour (/tour/new) vs editing existing
   * 4. Loads tour data or initializes empty form
   */
  ngOnInit(): void {
    this.newLog.date = this.getCurrentIsoDate();

    // Subscribe to route params and detect ID changes
    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$)) // Auto-unsubscribe on destroy
      .subscribe(params => {
        this.tourId.set(params['id']);

        // Special handling for creating new tours
        if (this.tourId() === 'new') {
          this.isNewTour.set(true);
          this.isEditing.set(true); // Immediately in edit mode
          this.initializeNewTour(); // Create empty tour template
        } else {
          // Existing tour: load and check for edit query param
          this.loadTour();

          this.activatedRoute.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(q => {
              this.isEditing.set(q['edit'] === 'true');
            });
        }
      });
  }

  /**
   * LIFECYCLE: Cleanup on component destroy
   * Clears timers and unsubscribes from observables
   * Prevents memory leaks when component is destroyed
   */
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

  /**
   * INITIALIZATION: Create new empty tour
   * Called when user navigates to /tour/new
   * Creates tour with temporary ID (will be replaced when saved)
   */
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
  }

  /**
   * INITIALIZATION: Load existing tour from service
   * Called when user navigates to /tour/{id} where {id} is not 'new'
   * Fetches tour from service and populates form
   */
  loadTour(): void {
    this.isLoading.set(true);
    const id = this.tourId();
    if (!id) return;

    const foundTour = this.tourService.getTourById(id);

    // Fallback for demo purpose if tour not found
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
        childFriendly: false,
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

  /**
   * UTILITY: Copy tour data to form object
   * Called after loading tour or creating new tour
   * Enables two-way binding from form fields back to tourForm object
   * This separates the tour data from form data until Save is clicked
   */
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

  /**
   * ACTION: Save tour changes
   * This demonstrates MVVM: form data validated, then persisted to service
   * 1. Clears previous error/success messages
   * 2. Validates form data via service
   * 3. If invalid, shows toast error and stops
   * 4. If valid, creates or updates tour via service
   * 5. Updates tour signal with new data
   * 6. Exits edit mode to show result
   * 7. Shows success toast notification
   */
  saveTour(): void {
    this.errorMessage.set('');
    this.saveMessage.set('');

    if (this.saveMessageTimeout) {
      clearTimeout(this.saveMessageTimeout);
    }

    // Validate form before persistence (prevents bad data in storage)
    const validationError = this.tourService.validateTourForm(this.tourForm);
    if (validationError) {
      this.toastService.show(validationError, true); // Show error toast
      return; // Stop execution
    }

    const currentTour = this.tour();
    if (!currentTour) return;

    // Prepare updates object with trimmed data
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

    // Choose create or update based on whether it's a new tour
    if (this.isNewTour()) {
      // CREATE: Add new tour to service
      const newTour = this.tourService.addTour({
        ...currentTour,
        ...updates,
        logs: []
      });
      this.tour.set(newTour);
      this.tourId.set(newTour.id);
      this.isNewTour.set(false); // No longer a new tour after save
    } else {
      // UPDATE: Modify existing tour
      this.tourService.updateTour(currentTour.id, updates);
      this.tour.set({ ...currentTour, ...updates });
    }

    // Exit edit mode to show result
    this.isEditing.set(false);
    this.toastService.show('Tour saved successfully!', false); // Success toast
    this.saveMessageTimeout = setTimeout(() => {
      this.saveMessage.set('');
    }, 3000); // Clear message after 3 seconds
  }

  /**
   * ACTION: Toggle between view and edit modes
   * If in edit mode: Save the tour
   * If in view mode: Enter edit mode
   */
  toggleEdit(): void {
    if (this.isEditing()) {
      this.saveTour();
    } else {
      this.isEditing.set(true);
    }
  }

  /**
   * ACTION: Cancel editing
   * If creating new tour: navigate back to home
   * If editing existing tour: reload original data, exit edit mode
   */
  cancel(): void {
    this.errorMessage.set('');
    this.saveMessage.set('');
    if (this.isNewTour()) {
      this.router.navigate(['/']); // Go back to tours list
    } else {
      this.isEditing.set(false); // Exit edit mode
      this.populateFormFromTour(); // Reload original data (discard changes)
    }
  }

  /**
   * ACTION: Select tour image
   * Used by image selection buttons in edit form
   * Updates tourForm.selectedImage which is displayed in two-way binding
   */
  selectImage(img: string): void {
    this.tourForm.selectedImage = img;
  }

  /**
   * ACTION: Add new tour log
   * Demonstrates nested CRUD: adding log to tour
   * 1. Validates log form (date, times, ranges)
   * 2. Calculates duration automatically
   * 3. Calls service to add log
   * 4. Updates tour signal with new logs array
   * 5. Shows success toast
   */
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

    // Calculate duration from start and end times
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
      // Fetch updated tour with new log
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

  /**
   * ACTION: Delete tour log with confirmation
   * 1. Asks user to confirm (prevent accidental deletion)
   * 2. Calls service to remove log from tour's logs array
   * 3. Updates tour signal with new logs array
   * UI automatically re-renders without deleted log
   */
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

  /**
   * ACTION: Load log data into edit form
   * Called when user clicks edit icon on a log entry
   * Converts date object to string format for input element
   * Sets editingLogId to indicate we're editing (not creating new)
   */
  editLog(logId: string): void {
    const logToEdit = this.tour()?.logs.find(l => l.id === logId);
    if (!logToEdit) return;

    // Convert date to ISO string for HTML date input
    let dateStr = '';
    if (logToEdit.date instanceof Date) {
      dateStr = logToEdit.date.toISOString().split('T')[0];
    } else if (typeof logToEdit.date === 'string') {
      dateStr = (logToEdit.date as string).split('T')[0];
    } else {
      dateStr = new Date(logToEdit.date as any).toISOString().split('T')[0];
    }

    // Copy log data into form for editing
    this.newLog = {
      date: dateStr,
      startTime: logToEdit.startTime,
      endTime: logToEdit.endTime,
      actualDistance: logToEdit.actualDistance,
      difficulty: logToEdit.difficulty,
      rating: logToEdit.rating,
      notes: logToEdit.notes
    };

    this.editingLogId.set(logId); // Track which log is being edited
    this.showLogForm.set(true); // Show the form
  }

  /**
   * ACTION: Save log changes (edit mode)
   * Similar to addLog but updates existing log instead of creating new
   * 1. Validates form
   * 2. Calculates duration
   * 3. Calls service.updateTourLog() instead of addTourLog()
   * 4. Updates tour signal
   * 5. Shows success toast
   */
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

  /**
   * ACTION: Cancel log editing
   * Resets form and hides log form
   * If user made changes but didn't save, they are discarded
   */
  cancelLogEdit(): void {
    this.editingLogId.set(null); // Clear editing state
    this.resetLogForm();
  }

  /**
   * UTILITY: Reset log form to defaults
   * Called after saving or canceling log operations
   * Resets to empty form with current date
   */
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

