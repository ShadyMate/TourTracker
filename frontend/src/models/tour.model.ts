export interface Tour {
  id: string;
  name: string;
  selectedImage: string;
  description: string;
  from: string;
  to: string;
  transportType: 'hiking' | 'cycling' | 'running' | 'walking' | '';
  distance: string;
  time: string;
  childFriendly: boolean;
  logs: TourLog[];
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