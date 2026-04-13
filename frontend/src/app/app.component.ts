/**
 * App Component - Root Component
 *
 * MVVM Role: Manages application-level concerns
 * - Dark mode reactive effect: watches AuthService.getDarkMode() signal
 * - When dark mode signal changes, automatically updates DOM
 * - This demonstrates signal effects: automatic side effects based on reactive state
 *
 * Dark Mode Flow:
 * 1. AuthService maintains isDarkMode signal
 * 2. User toggles dark mode in settings → isDarkMode signal updates
 * 3. effect() detected signal change
 * 4. DOM class updated: classList.add('dark-mode') or remove
 * 5. Global CSS uses :host-context(.dark-mode) to apply dark styles
 * 6. All child components automatically styled via CSS inheritance
 *
 * This is a pure MVVM pattern: signal state → automatic effect → DOM update
 */
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
    /**
     * EFFECT: Reactive side effect based on signal change
     * This is Angular's way of "watching" for changes and running code
     * Every time getDarkMode()() changes, this effect runs automatically
     *
     * Why this approach?
     * - Reactive: responds to state changes automatically
     * - No need to manually subscribe or unsubscribe
     * - No memory leaks (Angular manages cleanup)
     * - Separation: dark mode logic in service, UI effect in component
     */
    effect(() => {
      const isDark = this.authService.getDarkMode()();
      if (isDark) {
        document.documentElement.classList.add('dark-mode'); // Add dark mode class to root
      } else {
        document.documentElement.classList.remove('dark-mode'); // Remove dark mode class
      }
    });
  }
}