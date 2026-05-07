/**
 * Production Environment Configuration
 *
 * This file contains environment-specific settings for production.
 * API keys are loaded from localStorage at runtime.
 */

export const environment = {
  production: true,
  openRouteService: {
    geocodeUrl: 'https://api.openrouteservice.org/geocode/search',
    directionsUrl: 'https://api.openrouteservice.org/v2/directions'
  }
};
