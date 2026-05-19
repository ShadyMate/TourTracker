import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  input,
  output,
  ChangeDetectionStrategy,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tour } from '../../models/tour.model';
import { MapService } from '../../services/map.service';

/**
 * TourMapComponent - Displays an interactive map of a tour route
 *
 * Inputs:
 * - tour: The tour data containing from/to locations and transport type
 *
 * Responsibilities:
 * - Initialize Leaflet map container
 * - Fetch route data from OpenRouteService
 * - Display route and markers on map
 * - Handle loading and error states
 * - Cleanup map on component destruction
 */
@Component({
  selector: 'app-tour-map',
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div id="tour-map" class="map-element"></div>

      @if (isLoading()) {
        <div class="map-overlay map-loading">
          <div class="spinner"></div>
          <p>Loading route...</p>
        </div>
      } @else if (error()) {
        <div class="map-overlay map-error">
          <p>❌ {{ error() }}</p>
          <p class="error-hint">Make sure start and end locations are valid</p>
        </div>
      }

      @if (routeInfo() && !isLoading() && !error()) {
        <div class="route-info">
          <div class="info-item">
            <span class="label">Distance:</span>
            <span class="value">{{ routeInfo()!.distance.toFixed(1) }} km</span>
          </div>
          <div class="info-item">
            <span class="label">Duration:</span>
            <span class="value">{{ formatDuration(routeInfo()!.duration) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
    }

    .map-element {
      flex: 1;
      min-height: 400px;
    }

    .map-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
      background-color: #f5f5f5;
      z-index: 1000;
    }

    .map-loading {
      color: #666;
    }

    .map-error {
      color: #e74c3c;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e8e8e8;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-hint {
      font-size: 12px;
      opacity: 0.7;
      margin-top: -8px;
    }

    .route-info {
      display: flex;
      gap: 24px;
      padding: 12px 16px;
      background-color: #fff;
      border-top: 1px solid #eee;
      font-size: 14px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #333;
      font-weight: 600;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  private mapService = inject(MapService);

  tour = input.required<Tour>();
  routeLoaded = output<{ coordinates: [number, number][]; distance: number; duration: number }>();

  isLoading = signal(false);
  error = signal<string | null>(null);
  routeInfo = signal<{ distance: number; duration: number } | null>(null);

  private mapInitialized = false;
  private lastRouteKey = '';

  ngAfterViewInit(): void {
    this.mapService.initMap('tour-map');
    this.mapInitialized = true;

    setTimeout(() => {
      const tourData = this.tour();
      if (tourData?.from && tourData?.to) {
        this.lastRouteKey = this.getRouteKey(tourData);
        this.loadRoute(tourData);
      }
    }, 100);
  }

  ngOnChanges(): void {
    if (!this.mapInitialized) return;
    const tourData = this.tour();
    if (!tourData?.from || !tourData?.to) return;
    const key = this.getRouteKey(tourData);
    // Skip if same route key — avoids redundant re-renders after routeGeometry is set
    if (key === this.lastRouteKey) return;
    this.lastRouteKey = key;
    this.loadRoute(tourData);
  }

  private getRouteKey(tour: Tour): string {
    const from = tour.fromCoords?.join(',') ?? tour.from;
    const to = tour.toCoords?.join(',') ?? tour.to;
    return `${from}|${to}|${tour.transportType}`;
  }

  private async loadRoute(tour: Tour): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    this.routeInfo.set(null);

    // Use saved geometry when available — no external API call needed
    if (tour.routeGeometry && tour.routeGeometry.length > 0) {
      this.mapService.displayRoute(tour.routeGeometry, tour.from, tour.to);
      this.routeInfo.set({
        distance: parseFloat(tour.distance || '0') || 0,
        duration: this.parseTimeToMinutes(tour.time || '')
      });
      this.isLoading.set(false);
      return;
    }

    const profile = tour.transportType || 'hiking';

    try {
      let route: { distance: number; duration: number; coordinates: [number, number][] };

      if (tour.fromCoords && tour.toCoords) {
        route = await this.mapService.getRouteByCoords(tour.fromCoords, tour.toCoords, profile);
      } else {
        route = await this.mapService.getRoute(tour.from, tour.to, profile);
      }

      this.mapService.displayRoute(route.coordinates, tour.from, tour.to);
      this.routeInfo.set({ distance: route.distance, duration: route.duration });
      this.routeLoaded.emit({ coordinates: route.coordinates, distance: route.distance, duration: route.duration });
    } catch (err) {
      console.error('Failed to load route:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load route. Please check the locations.';

      if (errorMessage.includes('API key')) {
        this.error.set('API key not configured. Please add your ORS API key in Settings.');
      } else {
        this.error.set(errorMessage);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private parseTimeToMinutes(time: string): number {
    const hm = time.match(/(\d+)h\s*(?:(\d+)m)?/);
    if (hm) return parseInt(hm[1]) * 60 + (hm[2] ? parseInt(hm[2]) : 0);
    const mOnly = time.match(/^(\d+)m$/);
    if (mOnly) return parseInt(mOnly[1]);
    const colon = time.match(/^(\d+):(\d+)$/);
    if (colon) return parseInt(colon[1]) * 60 + parseInt(colon[2]);
    return 0;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }
}
