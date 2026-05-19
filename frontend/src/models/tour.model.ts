export interface Tour {
  id: string;
  name: string;
  selectedImage: string;
  description: string;
  from: string;
  to: string;
  fromCoords?: [number, number]; // [lat, lng] from geocode autocomplete
  toCoords?: [number, number];   // [lat, lng] from geocode autocomplete
  routeGeometry?: [number, number][]; // saved ORS route coordinates — avoids re-fetching on load
  transportType: 'hiking' | 'cycling' | 'walking' | '';
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