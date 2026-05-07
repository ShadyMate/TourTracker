import {
  Component,
  AfterViewInit,
  OnDestroy,
  input,
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
      @if (isLoading()) {
        <div class="map-loading">
          <div class="spinner"></div>
          <p>Loading route...</p>
        </div>
      } @else if (error()) {
        <div class="map-error">
          <p>❌ {{ error() }}</p>
          <p class="error-hint">Make sure start and end locations are valid</p>
        </div>
      } @else {
        <div id="tour-map" class="map-element"></div>
        @if (routeInfo()) {
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
      }
    </div>
  `,
  styles: [`
    .map-container {
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

    .map-loading,
    .map-error {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
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
export class TourMapComponent implements AfterViewInit, OnDestroy {
  private mapService = inject(MapService);

  // Input: tour data
  tour = input.required<Tour>();

  // State signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  routeInfo = signal<{ distance: number; duration: number } | null>(null);

  ngAfterViewInit(): void {
    // Initialize map on view initialization (after DOM is rendered)
    this.mapService.initMap('tour-map');

    // Wait a tick to ensure map is fully rendered, then load route
    setTimeout(() => {
      const tourData = this.tour();
      if (tourData && tourData.from && tourData.to) {
        this.loadRoute(tourData);
      }
    }, 100);
  }

  /**
   * Load route from OpenRouteService and display on map
   */
  private async loadRoute(tour: Tour): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    this.routeInfo.set(null);

    try {
      // Get route data from OpenRouteService
      const route = await this.mapService.getRoute(
        tour.from,
        tour.to,
        (tour.transportType as 'driving' | 'cycling' | 'walking' | 'hiking') || 'driving'
      );

      // Display route on map
      this.mapService.displayRoute(route.coordinates, tour.from, tour.to);

      // Store route info for display
      this.routeInfo.set({
        distance: route.distance,
        duration: route.duration
      });
    } catch (err) {
      console.error('Failed to load route:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load route. Please check the locations.';
      
      // Provide helpful error message for missing API key
      if (errorMessage.includes('API key')) {
        this.error.set(
          'API key not configured. Please add VITE_ORS_API_KEY to your .env file (get one at openrouteservice.org)'
        );
      } else {
        this.error.set(errorMessage);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Format duration from minutes to readable format (e.g., "1h 30m")
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours === 0) {
      return `${mins}m`;
    }
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  }

  ngOnDestroy(): void {
    // Cleanup map on component destruction
    this.mapService.destroyMap();
  }
}
