import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { AppInitializerService } from '../services/app-initializer.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (initializer: AppInitializerService) => () => {
        return initializer.initialize();
      },
      deps: [AppInitializerService],
      multi: true
    }
  ]
};