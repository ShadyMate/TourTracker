/**
 * Development Environment Configuration
 *
 * This file contains environment-specific settings for development.
 * API keys are loaded from localStorage at runtime.
 */

export const environment = {
  production: false,
  backendUrl: 'http://localhost:8080/api',
  openRouteService: {
    geocodeUrl: 'https://api.openrouteservice.org/geocode/search',
    autocompleteUrl: 'https://api.openrouteservice.org/geocode/autocomplete',
    directionsUrl: 'https://api.openrouteservice.org/v2/directions'
  }
};
