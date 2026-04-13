import { Injectable, signal, inject } from '@angular/core';
import { Tour, TourLog } from '../models/tour.model';
import { StorageService } from './storage.service';

/**
 * TourService - ViewModel/Model Layer
 *
 * MVVM Role: Acts as the ViewModel/Model, managing all business logic for tours
 * - Applications state is stored in the 'tours' signal (reactive state management)
 * - All tour operations (CRUD) go through this service
 * - Validation occurs here to maintain data integrity
 * - Components delegate to this service, not manipulating data directly
 * - Persistence is handled through StorageService
 */
@Injectable({
  providedIn: 'root'
})
export class TourService {
  private storage = inject(StorageService);

  // ViewModel State: Signals are Angular's reactive primitives
  // When tours change via .update(), all computed signals depending on tours() automatically recompute
  private tours = signal<Tour[]>(this.loadInitialTours());

  private loadInitialTours(): Tour[] {
    const stored = this.storage.getTours();
    if (stored.length > 0) {
      return stored;
    }
    
    // Default tours if storage is empty
    return [
      {
        id: '1',
        name: 'My favourite Tour',
        description: 'A scenic hiking tour',
        from: 'FH Technikum',
        to: 'Kahlenberg',
        distance: '6.6',
        time: '1h 56m',
        transportType: 'hiking',
        selectedImage: 'img3',
        childFriendly: true,
        logs: []
      },
      {
        id: '2',
        name: 'Mountain Peak Adventure',
        description: 'Challenge yourself with this mountain hike',
        from: 'Vienna',
        to: 'Mt. Everest Base',
        distance: '8300',
        time: '60 days',
        transportType: 'hiking',
        selectedImage: 'img2',
        childFriendly: false,
        logs: []
      },
      {
        id: '3',
        name: 'City Cycling Tour',
        description: 'Explore the city on a bike',
        from: 'City Center',
        to: 'Suburbs',
        distance: '25',
        time: '2h 30m',
        transportType: 'cycling',
        selectedImage: 'img1',
        childFriendly: true,
        logs: []
      }
    ];
  }

  /**
   * Exposes read-only tours signal to components
   * Components can subscribe to changes and automatically re-render via computed signals
   */
  getTours() {
    return this.tours.asReadonly();
  }

  /**
   * Retrieves specific tour by ID
   * Used when viewing/editing a single tour
   */
  getTourById(id: string): Tour | undefined {
    return this.tours().find(tour => tour.id === id);
  }

  /**
   * CRUD: CREATE - Adds new tour to collection
   * - Generates unique ID
   * - Uses immutable update pattern: [...tours, newTour]
   * - Persists to localStorage via StorageService
   * - Components auto-update via signal reactivity
   */
  addTour(tour: Omit<Tour, 'id'>): Tour {
    const newTour: Tour = {
      ...tour,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.tours.update(tours => {
      const updated = [...tours, newTour];
      this.storage.saveTours(updated);
      return updated;
    });
    return newTour;
  }

  /**
   * CRUD: UPDATE - Modifies existing tour
   * - Only updates if tour ID found (returns false if not found)
   * - Immutable update pattern preserves original array
   * - All dependent computed signals automatically recompute
   */
  updateTour(id: string, updates: Partial<Tour>): boolean {
    let found = false;
    this.tours.update(tours => {
      const updated = tours.map(tour => {
        if (tour.id === id) {
          found = true;
          return { ...tour, ...updates, id };
        }
        return tour;
      });
      if (found) {
        this.storage.saveTours(updated);
      }
      return updated;
    });
    return found;
  }

  /**
   * CRUD: DELETE - Removes tour from collection
   * - Filters out matching ID
   * - Persists change to storage
   * - UI automatically updates via signal reactivity
   */
  deleteTour(id: string): void {
    this.tours.update(tours => {
      const updated = tours.filter(tour => tour.id !== id);
      this.storage.saveTours(updated);
      return updated;
    });
  }

  /**
   * TOUR LOG CRUD: CREATE
   * - Automatically calculates total duration from start/end times
   * - Adds log to specific tour's logs array
   * - Persists entire tour structure (logs are nested in tour)
   */
  addTourLog(tourId: string, log: Omit<TourLog, 'id' | 'tourId'>): TourLog | null {
    const newLog: TourLog = {
      ...log,
      id: Date.now().toString(),
      tourId
    };

    let success = false;
    this.tours.update(tours => {
      const updated = tours.map(tour => {
        if (tour.id === tourId) {
          success = true;
          return { ...tour, logs: [...tour.logs, newLog] };
        }
        return tour;
      });
      if (success) {
        this.storage.saveTours(updated);
      }
      return updated;
    });

    return success ? newLog : null;
  }

  /**
   * TOUR LOG CRUD: UPDATE
   * - Finds tour by tourId, then finds log by logId within that tour
   * - Updates nested log object
   * - Preserves log ID and tourId association
   */
  updateTourLog(tourId: string, logId: string, updates: Partial<TourLog>): boolean {
    let success = false;
    this.tours.update(tours => {
      const updated = tours.map(tour => {
        if (tour.id === tourId) {
          const updatedLogs = tour.logs.map(log => {
            if (log.id === logId) {
              success = true;
              return { ...log, ...updates, id: logId, tourId };
            }
            return log;
          });
          return { ...tour, logs: updatedLogs };
        }
        return tour;
      });
      if (success) {
        this.storage.saveTours(updated);
      }
      return updated;
    });
    return success;
  }

  /**
   * TOUR LOG CRUD: DELETE
   * - Filters out log by ID from specific tour's logs array
   * - Checks length change to confirm deletion occurred
   */
  deleteTourLog(tourId: string, logId: string): boolean {
    let success = false;
    this.tours.update(tours => {
      const updated = tours.map(tour => {
        if (tour.id === tourId) {
          const updatedLogs = tour.logs.filter(log => log.id !== logId);
          if (updatedLogs.length !== tour.logs.length) {
            success = true;
          }
          return { ...tour, logs: updatedLogs };
        }
        return tour;
      });
      if (success) {
        this.storage.saveTours(updated);
      }
      return updated;
    });
    return success;
  }

  // Business logic: Filtering
  filterTours(tours: Tour[], query: string): Tour[] {
    if (!query.trim()) {
      return tours;
    }

    const lowerQuery = query.toLowerCase();
    return tours.filter(tour => {
      const basicMatch =
        tour.name.toLowerCase().includes(lowerQuery) ||
        tour.from.toLowerCase().includes(lowerQuery) ||
        tour.to.toLowerCase().includes(lowerQuery) ||
        tour.description.toLowerCase().includes(lowerQuery);

      const logsMatch = tour.logs.some(log =>
        log.notes.toLowerCase().includes(lowerQuery) ||
        log.difficulty.toString().includes(lowerQuery)
      );

      const popularityMatch =
        lowerQuery.includes('popular') ||
        lowerQuery.includes('log') ||
        lowerQuery === this.getPopularity(tour).toString();

      const childFriendlyMatch =
        this.getChildFriendliness(tour).toString() === lowerQuery ||
        (lowerQuery.includes('child') && this.getChildFriendliness(tour) >= 4) ||
        (lowerQuery.includes('beginner') && this.getChildFriendliness(tour) >= 4) ||
        (lowerQuery.includes('easy') && this.getChildFriendliness(tour) >= 3) ||
        (lowerQuery.includes('hard') && this.getChildFriendliness(tour) <= 2) ||
        (lowerQuery.includes('challenging') && this.getChildFriendliness(tour) <= 2);

      return basicMatch || logsMatch || popularityMatch || childFriendlyMatch;
    });
  }

  /**
   * CALCULATED PROPERTY: Popularity Score (1-10)
   * Derived from: number of logs + average rating
   * Used to rank/sort tours and display to users
   * If no logs, default low score
   */
  getPopularity(tour: Tour): number {
    if (tour.logs.length === 0) return 1; // No data = low score

    // Normalize logs count: assume max 20 logs = 10 points
    const logsScore = Math.min(tour.logs.length / 2, 10);

    // Normalize rating: convert 1-5 scale to 0-10 scale
    const avgRating = this.getAverageRating(tour);
    const ratingScore = (avgRating / 5) * 10;

    // Average both scores for final popularity
    const popularity = (logsScore + ratingScore) / 2;

    return Math.max(1, Math.min(10, popularity)); // Clamp to 1-10
  }

  /**
   * CALCULATED PROPERTY: Average Rating (1-5)
   * Computed by averaging all log ratings
   * Displays tour quality based on user experiences
   * If no logs, default to neutral 2.5
   */
  getAverageRating(tour: Tour): number {
    if (tour.logs.length === 0) return 2.5; // No data = neutral

    const totalRating = tour.logs.reduce((sum, log) => sum + log.rating, 0);
    return totalRating / tour.logs.length;
  }

  /**
   * STAR DISPLAY HELPER
   * Converts decimal rating to full/half/empty star counts
   * Returns: { full: 3, half: true, empty: 1 } for 3.5 stars
   * Used for UI rendering of star ratings
   */
  getRatingStars(rating: number): { full: number; half: boolean; empty: number } {
    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return {
      full: fullStars,
      half: hasHalfStar,
      empty: emptyStars
    };
  }

  /**
   * CALCULATED PROPERTY: Child-Friendliness Score (1-6)
   * Derived from: average difficulty, average time, average distance
   * Uses heuristics if no logs exist
   * Used for filtering and recommendations
   */
  getChildFriendliness(tour: Tour): number {
    if (tour.logs.length === 0) return 3; // Default to neutral if no data

    let score = 0;
    // Calculate averages from logs
    const avgDifficulty = tour.logs.reduce((sum, log) => sum + log.difficulty, 0) / tour.logs.length;
    const avgTimeMinutes = tour.logs.reduce((sum, log) => {
      const [h, m] = log.totalTime.split(':').map(Number);
      return sum + (h * 60 + m);
    }, 0) / tour.logs.length;
    const avgDistance = tour.logs.reduce((sum, log) => sum + log.actualDistance, 0) / tour.logs.length;

    // Award points for easy/short characteristics
    if (avgDifficulty < 5) score += 2; // Low difficulty = good for kids
    if (avgTimeMinutes < 180) score += 2; // Less than 3 hours = manageable
    if (avgDistance < 15) score += 2; // Less than 15km = reasonable distance

    return Math.min(6, score); // Cap at 6
  }

  /**
   * CALCULATED PROPERTY: Child-Friendliness Emoji Display
   * Visual representation of child-friendliness for UI
   */
  getChildFriendlinessEmoji(score: number): string {
    if (score === 0) return '⚠️'; // Not suitable
    if (score <= 2) return '🧗'; // Challenging
    if (score <= 4) return '🚶'; // Moderate
    return '👧'; // Very friendly
  }

  /**
   * CALCULATED PROPERTY: Child-Friendliness Text Label
   * Human-readable description for UI
   */
  getChildFriendlinessLabel(score: number): string {
    if (score === 0) return 'Not suitable';
    if (score <= 2) return 'Challenging';
    if (score <= 4) return 'Moderate';
    return 'Very friendly';
  }

  /**
   * CALCULATED PROPERTY: Average Actual Time
   * Computed by averaging total time from all logs
   * Provides estimate of actual time vs estimated time
   * Used for tour planning
   */
  getAverageActualTime(tour: Tour): string {
    if (tour.logs.length === 0) return 'N/A';

    const totalMinutes = tour.logs.reduce((sum, log) => {
      const [h, m] = log.totalTime.split(':').map(Number);
      return sum + (h * 60 + m);
    }, 0);

    const avgMinutes = Math.round(totalMinutes / tour.logs.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * UTILITY: Duration Calculation
   * Converts start/end times to elapsed time
   * Used when logging a tour activity
   * Error handling: returns '0:00' if parsing fails
   */
  calculateDuration(startTime: string, endTime: string): string {
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const duration = Math.max(0, endMin - startMin);
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}:${String(minutes).padStart(2, '0')}`;
    } catch {
      return '0:00'; // Fail gracefully, don't crash
    }
  }

  /**
   * INPUT VALIDATION: Tour Form
   * Prevents invalid data from entering the system (no crashes on bad input)
   * Returns error message if validation fails, null if valid
   */
  validateTourForm(form: Partial<Tour>): string | null {
    if (!form.name?.trim()) {
      return 'Tour name is required'; // Prevents empty names, whitespace-only names
    }
    if (!form.from?.trim()) {
      return 'Starting point is required';
    }
    if (!form.to?.trim()) {
      return 'Destination is required';
    }
    return null; // All validations passed
  }

  /**
   * INPUT VALIDATION: Tour Log Form
   * Ensures logs have valid data and logical time flow
   * Prevents crashes from invalid calculations (negative durations, NaN difficulty)
   */
  validateLogForm(log: Partial<TourLog>): string | null {
    // Required fields must be present
    if (!log.date || !log.startTime || !log.endTime) {
      return 'Date, start time, and end time are required';
    }
    // Distance must be positive for averaging
    if (log.actualDistance !== undefined && log.actualDistance <= 0) {
      return 'Actual distance must be greater than 0';
    }
    // Difficulty must be in 1-10 range for consistent calculations
    if (log.difficulty !== undefined && (log.difficulty < 1 || log.difficulty > 10)) {
      return 'Difficulty must be between 1-10';
    }

    // Time logic: ensure end time comes after start time (no negative durations)
    const [startH, startM] = log.startTime.split(':').map(Number);
    const [endH, endM] = log.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      return 'End time must be after start time';
    }

    return null; // All validations passed
  }
}