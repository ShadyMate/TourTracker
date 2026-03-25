import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal(false);
  private isDarkMode = signal<boolean>(this.loadDarkModePreference());

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  isUserAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  getDarkMode() {
    return this.isDarkMode.asReadonly();
  }

  login(email: string, password: string) {
    // Mock login
    const user: User = {
      id: '1',
      email,
      username: email.split('@')[0],
      firstName: 'John',
      lastName: 'Doe'
    };
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    return user;
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  register(email: string, password: string, firstName: string, lastName: string) {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      username: email.split('@')[0],
      firstName,
      lastName
    };
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    return user;
  }

  toggleDarkMode() {
    const newValue = !this.isDarkMode();
    this.isDarkMode.set(newValue);
    this.saveDarkModePreference(newValue);
    this.applyDarkMode(newValue);
  }

  setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
    this.saveDarkModePreference(isDark);
    this.applyDarkMode(isDark);
  }

  private applyDarkMode(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  private saveDarkModePreference(isDark: boolean) {
    localStorage.setItem('darkMode', isDark.toString());
  }

  private loadDarkModePreference(): boolean {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Default to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  initializeDarkMode() {
    this.applyDarkMode(this.isDarkMode());
  }
}
