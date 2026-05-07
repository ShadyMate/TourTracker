import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * AppInitializerService - Handles application initialization
 *
 * Loads API key from available sources:
 * 1. Public env.json file (created from .env at runtime)
 * 2. localStorage (if previously saved)
 * 3. Logs warning if none found
 */
@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {
  private configService = inject(ConfigService);
  private http = inject(HttpClient);

  /**
   * Initialize application configuration
   * Called during app bootstrap
   */
  async initialize(): Promise<void> {
    await this.loadApiKey();
  }

  /**
   * Attempt to load API key from available sources
   */
  private async loadApiKey(): Promise<void> {
    try {
      // First, try to load from env.json (created by load-env.js script)
      const env = await firstValueFrom(this.http.get<any>('/env.json'));
      const apiKeyFromEnv = env?.VITE_ORS_API_KEY;

      if (apiKeyFromEnv && apiKeyFromEnv.trim()) {
        this.configService.setOpenRouteServiceApiKey(apiKeyFromEnv);
        console.log('✅ API key loaded from .env file');
        return;
      }
    } catch (error) {
      // env.json might not exist or failed to load, continue to next source
      console.debug('env.json not found or failed to load, checking localStorage...');
    }

    // Check if key is already in localStorage
    const existingKey = localStorage.getItem('ors_api_key');
    if (existingKey && existingKey.trim()) {
      console.log('✅ API key found in localStorage');
      return;
    }

    // No key found - inform user
    console.warn(
      '⚠️  OpenRouteService API key not configured.\n' +
      'Make sure your .env file has VITE_ORS_API_KEY=your_api_key\n' +
      'Then restart the development server with: npm start'
    );
  }
}
