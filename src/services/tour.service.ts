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
      from: 'FH Technikum',
      to: 'Kahlenberg',
      distance: '6.6',
      time: '1h 56m',
      transportType: 'hiking',
      selectedImage: '',
      // difficulty: 3,
      // rating: 3,
      // elevationUp: 0,
      // elevationDown: 0,
      // childFriendly: true,
      // isFavorite: true,
      logs: [],
      // createdAt: new Date(),
      // updatedAt: new Date()
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
      selectedImage: '',
      // difficulty: 5,
      // rating: 4,
      // elevationUp: 5000,
      // elevationDown: 5000,
      // childFriendly: false,
      // isFavorite: false,
      logs: [],
      // createdAt: new Date(),
      // updatedAt: new Date()
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
      selectedImage: '',
      // difficulty: 2,
      // rating: 4,
      // elevationUp: 100,
      // elevationDown: 100,
      // childFriendly: true,
      // isFavorite: false,
      logs: [],
      // createdAt: new Date(),
      // updatedAt: new Date()
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