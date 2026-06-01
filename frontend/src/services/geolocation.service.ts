import { Injectable, signal, computed } from '@angular/core';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type GeolocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

const VIENNA_FALLBACK: UserLocation = { lat: 48.2082, lng: 16.3738 };

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private readonly _status = signal<GeolocationStatus>('idle');
  private readonly _location = signal<UserLocation | null>(null);
  private requestInFlight: Promise<UserLocation | null> | null = null;

  readonly status = this._status.asReadonly();
  readonly location = this._location.asReadonly();

  /** User location if available, Vienna as fallback. */
  readonly locationOrFallback = computed<UserLocation>(() => this._location() ?? VIENNA_FALLBACK);

  readonly isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  /**
   * Requests the user's location. Safe to call multiple times — returns the
   * cached value immediately if location was already obtained.
   */
  async requestLocation(): Promise<UserLocation | null> {
    if (this.requestInFlight) {
      return this.requestInFlight;
    }

    if (this._status() !== 'idle') {
      return this._location();
    }

    if (!this.isSupported) {
      this._status.set('unavailable');
      return null;
    }

    this._status.set('requesting');

    this.requestInFlight = new Promise<UserLocation | null>(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const loc: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this._location.set(loc);
          this._status.set('granted');
          resolve(loc);
        },
        error => {
          this._status.set(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }).finally(() => {
      this.requestInFlight = null;
    });

    return this.requestInFlight;
  }
}
