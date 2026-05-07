import { Injectable, signal } from '@angular/core';

/**
 * ConfigService - Manages application configuration
 *
 * Handles secure storage of API keys and other configuration
 * Uses localStorage for persistence across sessions
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly ORS_API_KEY_STORAGE = 'ors_api_key';

  // Signal for reactive updates when config changes
  private apiKeySignal = signal<string>(this.loadApiKeyFromStorage());

  constructor() {
    // Validate API key on initialization
    if (!this.apiKeySignal()) {
      console.warn(
        'OpenRouteService API key not configured. ' +
        'Please set it using ConfigService.setOpenRouteServiceApiKey() or navigate to settings.'
      );
    }
  }

  /**
   * Set OpenRouteService API key
   * Persists to localStorage for future sessions
   */
  setOpenRouteServiceApiKey(apiKey: string): void {
    if (!apiKey || apiKey.trim() === '') {
      console.error('API key cannot be empty');
      return;
    }

    try {
      localStorage.setItem(this.ORS_API_KEY_STORAGE, apiKey.trim());
      this.apiKeySignal.set(apiKey.trim());
      console.log('✅ API key configured successfully');
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  /**
   * Get OpenRouteService API key
   */
  getOpenRouteServiceApiKey(): string {
    return this.apiKeySignal();
  }

  /**
   * Get API key as readonly signal for reactive updates
   */
  getOpenRouteServiceApiKeySignal() {
    return this.apiKeySignal.asReadonly();
  }

  /**
   * Clear OpenRouteService API key
   */
  clearOpenRouteServiceApiKey(): void {
    try {
      localStorage.removeItem(this.ORS_API_KEY_STORAGE);
      this.apiKeySignal.set('');
      console.log('API key cleared');
    } catch (error) {
      console.error('Failed to clear API key:', error);
    }
  }

  /**
   * Check if API key is configured
   */
  isOpenRouteServiceApiKeyConfigured(): boolean {
    return !!this.apiKeySignal() && this.apiKeySignal().trim() !== '';
  }

  /**
   * Load API key from localStorage
   */
  private loadApiKeyFromStorage(): string {
    try {
      return localStorage.getItem(this.ORS_API_KEY_STORAGE) || '';
    } catch (error) {
      console.error('Failed to load API key from storage:', error);
      return '';
    }
  }
}
