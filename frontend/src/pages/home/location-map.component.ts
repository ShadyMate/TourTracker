import {
  Component,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import * as L from 'leaflet';

/**
 * LocationMapComponent - Simple map display for home page
 * Shows Vienna with no route calculations
 */
@Component({
  selector: 'app-location-map',
  template: `<div id="home-map" class="map-container"></div>`,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      width: 100%;
      height: 100%;
    }

    .map-container {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationMapComponent implements AfterViewInit, OnDestroy {
  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    // Initialize map after a small delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  private initializeMap(): void {
    try {
      const container = document.getElementById('home-map');
      if (!container) {
        console.error('Map container not found');
        return;
      }

      // Ensure container has dimensions
      if (container.offsetHeight === 0) {
        container.style.height = '100%';
      }

      // Create map centered on Vienna
      this.map = L.map('home-map').setView([48.2082, 16.3738], 11);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 2
      }).addTo(this.map);

      // Add a marker for Vienna
      L.marker([48.2082, 16.3738], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          shadowSize: [41, 41],
          iconAnchor: [12, 41],
          shadowAnchor: [12, 41],
          popupAnchor: [1, -34]
        })
      })
        .bindPopup('Vienna, Austria')
        .addTo(this.map);

      console.log('✅ Location map initialized');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
