import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { environment } from '../environments/environment';

interface BackendUser {
  id: number;
  username: string;
  email: string;
}

/**
 * AuthService - handles login, register, and session state.
 * Persists the logged-in userId to localStorage so the session
 * survives page refreshes.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private readonly API = environment.backendUrl;
  private readonly USER_ID_KEY = 'userId';
  private readonly USER_KEY = 'currentUser';

  private currentUser = signal<User | null>(this.loadStoredUser());
  private isAuthenticated = signal(this.currentUser() !== null);
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

  async login(username: string, password: string): Promise<User> {
    const backendUser = await firstValueFrom(
      this.http.post<BackendUser>(`${this.API}/users/login`, { username, password })
    );
    return this.applySession(backendUser);
  }

  async register(username: string, password: string, email: string): Promise<User> {
    const backendUser = await firstValueFrom(
      this.http.post<BackendUser>(`${this.API}/users/register`, { username, password, email })
    );
    return this.applySession(backendUser);
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getUserId(): number | null {
    const stored = localStorage.getItem(this.USER_ID_KEY);
    return stored ? parseInt(stored, 10) : null;
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

  private applySession(backendUser: BackendUser): User {
    const user: User = {
      id: backendUser.id.toString(),
      username: backendUser.username,
      email: backendUser.email ?? '',
      firstName: '',
      lastName: ''
    };
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem(this.USER_ID_KEY, backendUser.id.toString());
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
