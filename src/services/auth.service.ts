import { Injectable, signal, inject } from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storage = inject(StorageService);
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal(false);
  private isDarkMode = signal<boolean>(this.storage.getDarkModePreference());

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  isUserAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  getDarkMode() {
    return this.isDarkMode.asReadonly();
  }

  login(email: string, password: string): User {
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

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  register(email: string, password: string, firstName: string, lastName: string): User {
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

  toggleDarkMode(): void {
    const newValue = !this.isDarkMode();
    this.isDarkMode.set(newValue);
    this.storage.saveDarkModePreference(newValue);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    this.storage.saveDarkModePreference(isDark);
  }
}
