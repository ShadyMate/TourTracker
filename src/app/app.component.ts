import { Component, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastMessages } from "../pages/toast-messages/toast-messages.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastMessages],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  title = 'TourTracker';
  private authService = inject(AuthService);

  constructor() {
    effect(() => {
      const isDark = this.authService.getDarkMode()();
      if (isDark) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    });
  }
}