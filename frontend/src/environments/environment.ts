/**
 * Development Environment Configuration
 *
 * This file contains environment-specific settings for development.
 * API keys are loaded from localStorage at runtime.
 */

export const environment = {
  production: false,
  openRouteService: {
    geocodeUrl: 'https://api.openrouteservice.org/geocode/search',
    directionsUrl: 'https://api.openrouteservice.org/v2/directions'
  }
};
