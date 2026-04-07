import { Injectable } from '@angular/core';
import { Tour } from '../models/tour.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOURS_KEY = 'tours';
  private readonly DARK_MODE_KEY = 'darkMode';

  getTours(): Tour[] {
    try {
      const data = sessionStorage.getItem(this.TOURS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tours from storage:', error);
      return [];
    }
  }

  saveTours(tours: Tour[]): void {
    try {
      sessionStorage.setItem(this.TOURS_KEY, JSON.stringify(tours));
    } catch (error) {
      console.error('Error saving tours to storage:', error);
    }
  }

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
