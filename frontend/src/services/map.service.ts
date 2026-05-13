import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as L from 'leaflet';
import { environment } from '../environments/environment';
import { ConfigService } from './config.service';

/**
 * MapService - Manages map interactions and OpenRouteService API integration
 *
 * Responsibilities:
 * - Initialize Leaflet map instance
 * - Geocode addresses to coordinates using OpenRouteService
 * - Fetch route data from OpenRouteService for distance/time calculation
 * - Display route on map with markers for start/end points
 * - Handle map cleanup
 */
@Injectable({
  providedIn: 'root'
})
export class MapService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private map: L.Map | null = null;
  private routeLayer: L.Polyline | null = null;
  private markersLayer: L.FeatureGroup | null = null;

  // OpenRouteService API URLs from environment
  private readonly ORS_GEOCODE_URL = environment.openRouteService.geocodeUrl;
  private readonly ORS_AUTOCOMPLETE_URL = environment.openRouteService.autocompleteUrl;
  private readonly ORS_DIRECTIONS_URL = environment.openRouteService.directionsUrl;

  /**
   * Set the OpenRouteService API key
   * Persists to local storage and updates ConfigService
   * 
   * @param apiKey - The OpenRouteService API key
   */
  setApiKey(apiKey: string): void {
    this.configService.setOpenRouteServiceApiKey(apiKey);
  }

  /**
   * Check if API key is configured
   */
  private isApiKeyConfigured(): boolean {
    return this.configService.isOpenRouteServiceApiKeyConfigured();
  }

  /**
   * Get API key from ConfigService
   */
  private getApiKey(): string {
    return this.configService.getOpenRouteServiceApiKey();
  }

  /**
   * Initialize the map in a specific DOM container
   */
  initMap(containerId: string, center: [number, number] = [48.2082, 16.3738]): L.Map {
    if (this.map) {
      this.map.remove();
    }

    // Get container element
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Map container with id "${containerId}" not found`);
    }

    // Ensure container has dimensions
    if (container.offsetHeight === 0) {
      container.style.height = '400px';
    }

    // Create map instance (center on Vienna by default)
    this.map = L.map(containerId, {
      center: center,
      zoom: 10,
      layers: []
    });

    // Add OpenStreetMap tile layer with proper attribution
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 2
    });
    
    tileLayer.addTo(this.map);

    // Initialize layers for markers and routes
    this.markersLayer = L.featureGroup().addTo(this.map);

    console.log('✅ Map initialized successfully');
    return this.map;
  }

  /**
   * Get coordinates for an address using OpenRouteService Geocoding API
   */
  async geocodeAddress(address: string): Promise<[number, number]> {
    if (!this.isApiKeyConfigured()) {
      throw new Error(
        'OpenRouteService API key is not configured. ' +
        'Please set it in the settings or contact your administrator. ' +
        'Get a free key at https://openrouteservice.org/dev/#/signup'
      );
    }

    try {
      const response = await firstValueFrom(
        this.http.get<any>(this.ORS_GEOCODE_URL, {
          params: {
            text: address,
            api_key: this.getApiKey()
          }
        })
      );

      if (response.features && response.features.length > 0) {
        const coords = response.features[0].geometry.coordinates;
        return [coords[1], coords[0]]; // Return [lat, lng] for Leaflet
      }

      throw new Error(`No results found for address: ${address}`);
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete location suggestions from OpenRouteService
   * Returns up to 5 suggestions with display label and [lat, lng] coordinates
   */
  async geocodeAutocomplete(text: string): Promise<Array<{ label: string; coords: [number, number] }>> {
    if (!this.isApiKeyConfigured()) {
      return [];
    }
    if (!text || text.trim().length < 2) {
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.http.get<any>(this.ORS_AUTOCOMPLETE_URL, {
          params: {
            text: text.trim(),
            api_key: this.getApiKey(),
            size: '5'
          }
        })
      );

      if (!response.features || response.features.length === 0) {
        return [];
      }

      return response.features.map((feature: any) => {
        const coords = feature.geometry.coordinates; // [lng, lat]
        const props = feature.properties;
        // Build human-readable label from available properties
        const parts = [props.name, props.locality, props.region, props.country]
          .filter(Boolean);
        const label = parts.length > 0 ? parts.join(', ') : props.label || text;
        return {
          label,
          coords: [coords[1], coords[0]] as [number, number] // [lat, lng]
        };
      });
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Get route using pre-geocoded coordinates (skips geocoding step)
   */
  async getRouteByCoords(
    fromCoords: [number, number],
    toCoords: [number, number],
    profile: 'driving' | 'cycling' | 'walking' | 'hiking' = 'driving'
  ): Promise<{
    distance: number;
    duration: number;
    coordinates: [number, number][];
  }> {
    const [fromLat, fromLng] = fromCoords;
    const [toLat, toLng] = toCoords;
    const orsProfile = this.mapProfileToORS(profile);
    const directionsUrl = `${this.ORS_DIRECTIONS_URL}/${orsProfile}`;

    const response = await firstValueFrom(
      this.http.post<any>(
        directionsUrl,
        { coordinates: [[fromLng, fromLat], [toLng, toLat]] },
        {
          headers: {
            'Authorization': this.getApiKey(),
            'Content-Type': 'application/json'
          }
        }
      )
    );

    if (!response.routes || response.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = response.routes[0];
    let coordinates: [number, number][] = [];

    if (route.geometry) {
      if (Array.isArray(route.geometry.coordinates)) {
        coordinates = this.decodePolyline(route.geometry.coordinates);
      } else if (Array.isArray(route.geometry)) {
        coordinates = this.decodePolyline(route.geometry);
      }
    }

    if (coordinates.length === 0) {
      throw new Error('No valid coordinates found in route response');
    }

    return {
      distance: route.summary.distance / 1000,
      duration: route.summary.duration / 60,
      coordinates
    };
  }

  /**
   * Get route and distance/time data from OpenRouteService
   */
  async getRoute(
    from: string,
    to: string,
    profile: 'driving' | 'cycling' | 'walking' | 'hiking' = 'driving'
  ): Promise<{
    distance: number;
    duration: number;
    coordinates: [number, number][];
  }> {
    try {
      // Geocode both addresses
      const [fromLat, fromLng] = await this.geocodeAddress(from);
      const [toLat, toLng] = await this.geocodeAddress(to);

      // Determine ORS profile
      const orsProfile = this.mapProfileToORS(profile);
      const directionsUrl = `${this.ORS_DIRECTIONS_URL}/${orsProfile}`;

      // Request route from OpenRouteService
      const response = await firstValueFrom(
        this.http.post<any>(
          directionsUrl,
          {
            coordinates: [
              [fromLng, fromLat],
              [toLng, toLat]
            ]
          },
          {
            headers: {
              'Authorization': this.getApiKey(),
              'Content-Type': 'application/json'
            }
          }
        )
      );

      console.log('Full ORS response:', response);
      console.log('Routes array:', response.routes);

      if (response.routes && response.routes.length > 0) {
        const route = response.routes[0];
        
        console.log('ORS Route response:', route);
        console.log('Route geometry:', route.geometry);
        
        // Handle different geometry formats from ORS API
        let coordinates: [number, number][] = [];
        
        if (route.geometry) {
          if (Array.isArray(route.geometry.coordinates)) {
            // GeoJSON format: coordinates is array of [lng, lat]
            coordinates = this.decodePolyline(route.geometry.coordinates);
          } else if (typeof route.geometry === 'string') {
            // Encoded polyline format
            coordinates = this.decodePolyline(route.geometry);
          } else if (Array.isArray(route.geometry)) {
            // Direct array format
            coordinates = this.decodePolyline(route.geometry);
          }
        } else if (route.geometry_array) {
          // Alternative key name
          coordinates = this.decodePolyline(route.geometry_array);
        }

        console.log('Decoded coordinates:', coordinates);

        if (coordinates.length === 0) {
          throw new Error('No valid coordinates found in route response');
        }

        return {
          distance: route.summary.distance / 1000, // Convert to km
          duration: route.summary.duration / 60, // Convert to minutes
          coordinates: coordinates
        };
      }

      throw new Error('No route found');
    } catch (error) {
      console.error('Route error:', error);
      throw error;
    }
  }

  /**
   * Display route on map with start and end markers
   */
  displayRoute(
    coordinates: [number, number][],
    fromAddress: string,
    toAddress: string
  ): void {
    if (!this.map || !this.markersLayer) {
      console.error('Map not initialized');
      return;
    }

    // Use a Promise to wait for map to be truly ready
    Promise.resolve().then(() => {
      try {
        // Validate coordinates
        if (!coordinates || coordinates.length < 2) {
          throw new Error('Invalid coordinates for route');
        }

        // Clear existing markers and routes
        this.markersLayer!.clearLayers();
        if (this.routeLayer) {
          this.map!.removeLayer(this.routeLayer);
          this.routeLayer = null;
        }

        console.log('Adding route with coordinates:', coordinates);

        // Add route polyline
        const polylineCoords = coordinates.map(coord => [coord[0], coord[1]] as L.LatLngExpression);
        this.routeLayer = L.polyline(polylineCoords, {
          color: '#FF6B6B',
          weight: 4,
          opacity: 0.8
        });
        
        this.routeLayer.addTo(this.map!);

        // Add start marker
        const startMarker = L.marker([coordinates[0][0], coordinates[0][1]], {
          icon: this.createMarkerIcon('#2ECC71')
        });
        startMarker.bindPopup('Start: ' + fromAddress);
        startMarker.addTo(this.markersLayer!);

        // Add end marker
        const lastCoord = coordinates[coordinates.length - 1];
        const endMarker = L.marker([lastCoord[0], lastCoord[1]], {
          icon: this.createMarkerIcon('#E74C3C')
        });
        endMarker.bindPopup('End: ' + toAddress);
        endMarker.addTo(this.markersLayer!);

        // Fit map to route bounds
        const bounds = L.latLngBounds(polylineCoords);
        this.map!.fitBounds(bounds, { padding: [50, 50] });
        
        console.log('✅ Route displayed successfully');
      } catch (error) {
        console.error('Error displaying route:', error);
        throw error;
      }
    });
  }

  /**
   * Map tour transport type to OpenRouteService profile
   */
  private mapProfileToORS(
    profile: 'driving' | 'cycling' | 'walking' | 'hiking'
  ): string {
    const profileMap: Record<string, string> = {
      driving: 'driving-car',
      cycling: 'cycling-regular',
      walking: 'foot-walking',
      hiking: 'foot-hiking'
    };
    return profileMap[profile] || 'driving-car';
  }

  /**
   * Create custom marker icon with color
   */
  private createMarkerIcon(color: string): L.Icon {
    return L.icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <circle cx="12" cy="12" r="10" fill="${color}"/>
          <circle cx="12" cy="12" r="7" fill="white"/>
          <circle cx="12" cy="12" r="4" fill="${color}"/>
        </svg>`
      )}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  }

  /**
   * Decode polyline coordinates (if ORS returns encoded polyline)
   */
  private decodePolyline(
    coordinates: number[][] | string
  ): [number, number][] {
    // ORS returns coordinates as array, not encoded polyline
    if (Array.isArray(coordinates) && coordinates.length > 0) {
      return coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
    }
    return [];
  }

  /**
   * Clear map and remove all layers
   */
  clearMap(): void {
    if (this.markersLayer) {
      this.markersLayer.clearLayers();
    }
    if (this.routeLayer && this.map) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }
  }

  /**
   * Remove map instance
   */
  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.routeLayer = null;
      this.markersLayer = null;
    }
  }

  /**
   * Get current map instance
   */
  getMap(): L.Map | null {
    return this.map;
  }
}
