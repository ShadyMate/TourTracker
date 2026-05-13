import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly DARK_MODE_KEY = 'darkMode';

  getDarkModePreference(): boolean {
    const saved = localStorage.getItem(this.DARK_MODE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  saveDarkModePreference(isDark: boolean): void {
    localStorage.setItem(this.DARK_MODE_KEY, isDark.toString());
  }
}
