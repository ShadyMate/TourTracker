import {
  Component,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { GeolocationService, UserLocation } from '../../services/geolocation.service';

@Component({
  selector: 'app-location-map',
  template: `<div id="home-map" class="map-container"></div>`,
  styles: [
    `
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

      @keyframes tt-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.45);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationMapComponent implements AfterViewInit, OnDestroy {
  private readonly geolocationService = inject(GeolocationService);
  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeMap(), 300);
  }

  private async initializeMap(): Promise<void> {
    try {
      const container = document.getElementById('home-map');
      if (!container) {
        return;
      }

      if (container.offsetHeight === 0) {
        container.style.height = '100%';
      }

      const userLoc = await this.geolocationService.requestLocation();
      const center = this.toLatLng(this.geolocationService.locationOrFallback());
      const zoom = userLoc ? 13 : 11;

      this.map = L.map('home-map').setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 2,
      }).addTo(this.map);

      this.addLocationMarker(userLoc);

      console.log('✅ Location map initialized');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private addLocationMarker(userLoc: UserLocation | null): void {
    if (!this.map) return;

    const fallback = this.geolocationService.locationOrFallback();

    if (userLoc) {
      L.marker([userLoc.lat, userLoc.lng], { icon: this.buildUserIcon() })
        .bindPopup('Your location')
        .addTo(this.map)
        .openPopup();
    } else {
      L.marker([fallback.lat, fallback.lng], { icon: this.buildDefaultIcon() })
        .bindPopup('Vienna, Austria')
        .addTo(this.map);
    }
  }

  private toLatLng(loc: UserLocation): L.LatLngExpression {
    return [loc.lat, loc.lng];
  }

  private buildDefaultIcon(): L.Icon {
    return L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      shadowSize: [41, 41],
      iconAnchor: [12, 41],
      shadowAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }

  private buildUserIcon(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<div style="
        width: 18px; height: 18px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        animation: tt-pulse 2s ease-out infinite;
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -12],
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
