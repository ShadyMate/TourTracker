import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Tour, TourLog } from '../models/tour.model';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

// Shape the backend sends/receives
interface BackendTour {
  id: number;
  name: string;
  description: string;
  startLocation: string;
  endLocation: string;
  transportType: string;
  distance: number | null;
  estimatedTime: number | null; // minutes
  selectedImage: string | null;
  fromLat: number | null;
  fromLng: number | null;
  toLat: number | null;
  toLng: number | null;
  routeGeometry: string | null;
  logs: BackendLog[];
}

interface BackendLog {
  id: number;
  tourId: number;
  logDate: string;    // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  totalTime: string;  // "H:mm"
  actualDistance: number;
  difficulty: number;
  rating: number;
  notes: string;
}

/**
 * TourService - all tour and tour-log CRUD backed by the Spring Boot API.
 * Keeps the same method signatures that components already use.
 */
@Injectable({
  providedIn: 'root'
})
export class TourService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly API = environment.backendUrl;

  // ── Tour CRUD ──────────────────────────────────────────────────────────────

  async getTours(): Promise<Tour[]> {
    const backend = await firstValueFrom(
      this.http.get<BackendTour[]>(`${this.API}/tours`)
    );
    return backend.map(this.toFrontend);
  }

  async getTourById(id: string): Promise<Tour | null> {
    try {
      const backend = await firstValueFrom(
        this.http.get<BackendTour>(`${this.API}/tours/${id}`)
      );
      return this.toFrontend(backend);
    } catch {
      return null;
    }
  }

  async addTour(tour: Omit<Tour, 'id'>): Promise<Tour> {
    const payload = this.toBackend({ ...tour, id: '' });
    const saved = await firstValueFrom(
      this.http.post<BackendTour>(`${this.API}/tours`, payload)
    );
    return this.toFrontend(saved);
  }

  async updateTour(id: string, updates: Partial<Tour>): Promise<Tour> {
    const current = await this.getTourById(id);
    const merged: Tour = { ...(current ?? ({} as Tour)), ...updates, id };
    const payload = this.toBackend(merged);
    const saved = await firstValueFrom(
      this.http.put<BackendTour>(`${this.API}/tours/${id}`, payload)
    );
    return this.toFrontend(saved);
  }

  async deleteTour(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.API}/tours/${id}`));
  }

  // ── Tour Log CRUD ──────────────────────────────────────────────────────────

  async addTourLog(tourId: string, log: Omit<TourLog, 'id' | 'tourId'>): Promise<TourLog> {
    const payload = this.logToBackend({ ...log, id: '', tourId });
    const saved = await firstValueFrom(
      this.http.post<BackendLog>(`${this.API}/tours/${tourId}/logs`, payload)
    );
    return this.logToFrontend(saved);
  }

  async updateTourLog(tourId: string, logId: string, updates: Partial<TourLog>): Promise<TourLog> {
    const payload = this.logToBackend({ ...updates, id: logId, tourId } as TourLog);
    const saved = await firstValueFrom(
      this.http.put<BackendLog>(`${this.API}/tours/${tourId}/logs/${logId}`, payload)
    );
    return this.logToFrontend(saved);
  }

  async deleteTourLog(tourId: string, logId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.API}/tours/${tourId}/logs/${logId}`)
    );
  }

  // ── Search (client-side over fetched tours) ────────────────────────────────

  filterTours(tours: Tour[], query: string): Tour[] {
    if (!query.trim()) return tours;
    const q = query.toLowerCase();
    return tours.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.from.toLowerCase().includes(q) ||
      t.to.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.logs.some(l => l.notes.toLowerCase().includes(q))
    );
  }

  // ── Computed properties (unchanged business logic) ─────────────────────────

  getPopularity(tour: Tour): number {
    if (tour.logs.length === 0) return 1;
    const logsScore = Math.min(tour.logs.length / 2, 10);
    const ratingScore = (this.getAverageRating(tour) / 5) * 10;
    return Math.max(1, Math.min(10, (logsScore + ratingScore) / 2));
  }

  getAverageRating(tour: Tour): number {
    if (tour.logs.length === 0) return 2.5;
    return tour.logs.reduce((s, l) => s + l.rating, 0) / tour.logs.length;
  }

  getRatingStars(rating: number): { full: number; half: boolean; empty: number } {
    const full = Math.floor(rating);
    const half = (rating % 1) >= 0.5;
    return { full, half, empty: 5 - full - (half ? 1 : 0) };
  }

  getChildFriendliness(tour: Tour): number {
    if (tour.logs.length === 0) return 3;
    let score = 0;
    const n = tour.logs.length;
    const avgDiff = tour.logs.reduce((s, l) => s + l.difficulty, 0) / n;
    const avgMin = tour.logs.reduce((s, l) => {
      const [h, m] = l.totalTime.split(':').map(Number);
      return s + h * 60 + m;
    }, 0) / n;
    const avgDist = tour.logs.reduce((s, l) => s + l.actualDistance, 0) / n;
    if (avgDiff < 5) score += 2;
    if (avgMin < 180) score += 2;
    if (avgDist < 15) score += 2;
    return Math.min(6, score);
  }

  getChildFriendlinessLabel(score: number): string {
    if (score === 0) return 'Not suitable';
    if (score <= 2) return 'Challenging';
    if (score <= 4) return 'Moderate';
    return 'Very friendly';
  }

  getChildFriendlinessEmoji(score: number): string {
    if (score === 0) return '⚠️';
    if (score <= 2) return '🧗';
    if (score <= 4) return '🚶';
    return '👧';
  }

  getAverageActualTime(tour: Tour): string {
    if (tour.logs.length === 0) return 'N/A';
    const total = tour.logs.reduce((s, l) => {
      const [h, m] = l.totalTime.split(':').map(Number);
      return s + h * 60 + m;
    }, 0);
    const avg = Math.round(total / tour.logs.length);
    return `${Math.floor(avg / 60)}:${String(avg % 60).padStart(2, '0')}`;
  }

  calculateDuration(start: string, end: string): string {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const d = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
      return `${Math.floor(d / 60)}:${String(d % 60).padStart(2, '0')}`;
    } catch { return '0:00'; }
  }

  validateTourForm(form: Partial<Tour>): string | null {
    if (!form.name?.trim()) return 'Tour name is required';
    if (!form.from?.trim()) return 'Starting point is required';
    if (!form.to?.trim()) return 'Destination is required';
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
    const [sh, sm] = log.startTime.split(':').map(Number);
    const [eh, em] = log.endTime.split(':').map(Number);
    if (eh * 60 + em <= sh * 60 + sm) return 'End time must be after start time';
    return null;
  }

  // ── Mapping: frontend ↔ backend ────────────────────────────────────────────

  private toFrontend = (b: BackendTour): Tour => ({
    id: b.id.toString(),
    name: b.name ?? '',
    description: b.description ?? '',
    from: b.startLocation ?? '',
    to: b.endLocation ?? '',
    fromCoords: (b.fromLat != null && b.fromLng != null)
      ? [b.fromLat, b.fromLng] : undefined,
    toCoords: (b.toLat != null && b.toLng != null)
      ? [b.toLat, b.toLng] : undefined,
    routeGeometry: b.routeGeometry ? JSON.parse(b.routeGeometry) : undefined,
    transportType: (b.transportType ?? 'hiking') as Tour['transportType'],
    distance: b.distance != null ? b.distance.toString() : '0',
    time: b.estimatedTime != null ? this.minutesToTimeStr(b.estimatedTime) : '',
    selectedImage: b.selectedImage ?? '',
    childFriendly: false,
    logs: (b.logs ?? []).map(this.logToFrontend)
  });

  private toBackend(t: Tour): Partial<BackendTour> {
    return {
      name: t.name,
      description: t.description,
      startLocation: t.from,
      endLocation: t.to,
      transportType: t.transportType,
      distance: t.distance ? parseFloat(t.distance) : null,
      estimatedTime: t.time ? this.timeStrToMinutes(t.time) : null,
      selectedImage: t.selectedImage || null,
      fromLat: t.fromCoords?.[0] ?? null,
      fromLng: t.fromCoords?.[1] ?? null,
      toLat: t.toCoords?.[0] ?? null,
      toLng: t.toCoords?.[1] ?? null,
      routeGeometry: t.routeGeometry ? JSON.stringify(t.routeGeometry) : null
    };
  }

  private logToFrontend = (b: BackendLog): TourLog => ({
    id: b.id.toString(),
    tourId: b.tourId.toString(),
    date: b.logDate ? new Date(b.logDate) : new Date(),
    startTime: b.startTime ?? '',
    endTime: b.endTime ?? '',
    totalTime: b.totalTime ?? '0:00',
    actualDistance: b.actualDistance ?? 0,
    difficulty: b.difficulty ?? 5,
    rating: b.rating ?? 2.5,
    notes: b.notes ?? ''
  });

  private logToBackend(l: TourLog): Partial<BackendLog> {
    const dateStr = l.date instanceof Date
      ? l.date.toISOString().split('T')[0]
      : String(l.date).split('T')[0];
    return {
      logDate: dateStr,
      startTime: l.startTime,
      endTime: l.endTime,
      totalTime: l.totalTime,
      actualDistance: l.actualDistance,
      difficulty: l.difficulty,
      rating: l.rating,
      notes: l.notes
    };
  }

  // ── Time string helpers ────────────────────────────────────────────────────
  // Backend stores estimated time as total minutes (Long)

  private timeStrToMinutes(time: string): number {
    // Accept "1h 30m", "2h", "45m", "1:30"
    const hm = time.match(/(\d+)h\s*(?:(\d+)m)?/);
    if (hm) return parseInt(hm[1]) * 60 + (hm[2] ? parseInt(hm[2]) : 0);
    const colon = time.match(/^(\d+):(\d+)$/);
    if (colon) return parseInt(colon[1]) * 60 + parseInt(colon[2]);
    const mOnly = time.match(/^(\d+)m$/);
    if (mOnly) return parseInt(mOnly[1]);
    return 0;
  }

  private minutesToTimeStr(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
}
