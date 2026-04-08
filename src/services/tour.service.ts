import { Injectable, signal, inject } from '@angular/core';
import { Tour, TourLog } from '../models/tour.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private storage = inject(StorageService);
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

  getTours() {
    return this.tours.asReadonly();
  }

  getTourById(id: string): Tour | undefined {
    return this.tours().find(tour => tour.id === id);
  }

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

  deleteTour(id: string): void {
    this.tours.update(tours => {
      const updated = tours.filter(tour => tour.id !== id);
      this.storage.saveTours(updated);
      return updated;
    });
  }

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

  // Business logic: Calculations
  getPopularity(tour: Tour): number {
    if (tour.logs.length === 0) return 1;

    // Normalize logs count (assume max 20 logs = 10/10)
    const logsScore = Math.min(tour.logs.length / 2, 10);
    
    // Normalize rating (1-5 scale to 0-10 scale)
    const avgRating = this.getAverageRating(tour);
    const ratingScore = (avgRating / 5) * 10;
    
    // Average of both scores
    const popularity = (logsScore + ratingScore) / 2;
    
    return Math.max(1, Math.min(10, popularity));
  }

  getAverageRating(tour: Tour): number {
    if (tour.logs.length === 0) return 2.5;
    
    const totalRating = tour.logs.reduce((sum, log) => sum + log.rating, 0);
    return totalRating / tour.logs.length;
  }

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

  getChildFriendliness(tour: Tour): number {
    if (tour.logs.length === 0) return 3;

    let score = 0;
    const avgDifficulty = tour.logs.reduce((sum, log) => sum + log.difficulty, 0) / tour.logs.length;
    const avgTimeMinutes = tour.logs.reduce((sum, log) => {
      const [h, m] = log.totalTime.split(':').map(Number);
      return sum + (h * 60 + m);
    }, 0) / tour.logs.length;
    const avgDistance = tour.logs.reduce((sum, log) => sum + log.actualDistance, 0) / tour.logs.length;

    if (avgDifficulty < 5) score += 2;
    if (avgTimeMinutes < 180) score += 2;
    if (avgDistance < 15) score += 2;

    return Math.min(6, score);
  }

  getChildFriendlinessEmoji(score: number): string {
    if (score === 0) return '⚠️';
    if (score <= 2) return '🧗';
    if (score <= 4) return '🚶';
    return '👧';
  }

  getChildFriendlinessLabel(score: number): string {
    if (score === 0) return 'Not suitable';
    if (score <= 2) return 'Challenging';
    if (score <= 4) return 'Moderate';
    return 'Very friendly';
  }

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
      return '0:00';
    }
  }

  validateTourForm(form: Partial<Tour>): string | null {
    if (!form.name?.trim()) {
      return 'Tour name is required';
    }
    if (!form.from?.trim()) {
      return 'Starting point is required';
    }
    if (!form.to?.trim()) {
      return 'Destination is required';
    }
    return null;
  }

  validateLogForm(log: Partial<TourLog>): string | null {
    if (!log.date || !log.startTime || !log.endTime) {
      return 'Date, start time, and end time are required';
    }
    if (log.actualDistance !== undefined && log.actualDistance <= 0) {
      return 'Actual distance must be greater than 0';
    }
    if (log.difficulty !== undefined && (log.difficulty < 1 || log.difficulty > 10)) {
      return 'Difficulty must be between 1-10';
    }

    const [startH, startM] = log.startTime.split(':').map(Number);
    const [endH, endM] = log.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      return 'End time must be after start time';
    }

    return null;
  }
}