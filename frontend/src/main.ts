import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';
import { ConfigService } from './services/config.service';

// Load environment variables synchronously before bootstrap
(async () => {
  try {
    const response = await fetch('/env.json');
    if (response.ok) {
      const env = await response.json();
      if (env.VITE_ORS_API_KEY && env.VITE_ORS_API_KEY.trim()) {
        // Store in localStorage immediately
        localStorage.setItem('ors_api_key', env.VITE_ORS_API_KEY);
        console.log('✅ API key loaded from .env file');
      }
    }
  } catch (error) {
    console.debug('env.json not available:', error);
  }

  // Now bootstrap the app
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
})();
