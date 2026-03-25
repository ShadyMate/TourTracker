export interface Tour {
  id: string;
  name: string;
  description: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  estimatedTime: string;
  transportType: 'hiking' | 'cycling' | 'running' | 'walking';
  difficulty: number; // 1-10
  rating: number; // 1-5
  imageUrl?: string;
  elevationUp: number; // in meters
  elevationDown: number; // in meters
  childFriendly: boolean;
  isFavorite: boolean;
  logs: TourLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TourLog {
  id: string;
  tourId: string;
  date: Date;
  startTime: string;
  endTime: string;
  actualDistance: number;
  difficulty: number; // 1-10
  totalTime: string;
  rating: number;
  notes: string;
}