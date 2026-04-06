export interface Tour {
  // name, tour description, from, to, transport type, tour distance, estimated time, route information
  id: string;
  name: string;
  selectedImage: string;
  description: string;
  from: string;
  to: string;
  transportType: 'hiking' | 'cycling' | 'running' | 'walking' | '';
  distance: string;
  time: string;
  // difficulty: number; // 1-10
  // rating: number; // 1-5
  // imageUrl?: string;
  // elevationUp: number; // in meters
  // elevationDown: number; // in meters
  // childFriendly: boolean;
  // isFavorite: boolean;
  logs: TourLog[];
  // createdAt: Date;
  // updatedAt: Date;
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