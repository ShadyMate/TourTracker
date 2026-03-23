import { Injectable, signal } from '@angular/core';
import { Tour, TourLog } from '../models/tour.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private tours = signal<Tour[]>([
    {
      id: '1',
      name: 'My favourite Tour',
      description: 'A scenic hiking tour',
      startPoint: 'FH Technikum',
      endPoint: 'Kahlenberg',
      distance: 6.6,
      estimatedTime: '1h 56m',
      transportType: 'hiking',
      difficulty: 3,
      rating: 3
    },
    {
      id: '2',
      name: 'Mountain Peak Adventure',
      description: 'Challenge yourself with this mountain hike',
      startPoint: 'Vienna',
      endPoint: 'Mt. Everest Base',
      distance: 8300,
      estimatedTime: '60 days',
      transportType: 'hiking',
      difficulty: 5,
      rating: 4
    },
    {
      id: '3',
      name: 'City Cycling Tour',
      description: 'Explore the city on a bike',
      startPoint: 'City Center',
      endPoint: 'Suburbs',
      distance: 25,
      estimatedTime: '2h 30m',
      transportType: 'cycling',
      difficulty: 2,
      rating: 4
    }
  ]);

  private tourLogs = signal<TourLog[]>([]);

  getTours() {
    return this.tours.asReadonly();
  }

  getTourById(id: string) {
    return this.tours().find(tour => tour.id === id);
  }

  addTour(tour: Omit<Tour, 'id'>) {
    const newTour: Tour = {
      ...tour,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.tours.update(tours => [...tours, newTour]);
    return newTour;
  }

  deleteTour(id: string) {
    this.tours.update(tours => tours.filter(tour => tour.id !== id));
  }

  getTourLogs(tourId: string) {
    return this.tourLogs().filter(log => log.tourId === tourId);
  }

  addTourLog(log: Omit<TourLog, 'id'>) {
    const newLog: TourLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.tourLogs.update(logs => [...logs, newLog]);
    return newLog;
  }
}