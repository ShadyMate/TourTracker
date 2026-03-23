export interface Tour {
  id: string;
  name: string;
  description: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  estimatedTime: string;
  transportType: 'hiking' | 'cycling' | 'running' | 'walking';
  difficulty: number;
  rating: number;
  imageUrl?: string;
}

export interface TourLog {
  id: string;
  tourId: string;
  date: Date;
  time: string;
  comment: string;
  difficulty: number;
  totalDistance: number;
  totalTime: string;
  rating: number;
}