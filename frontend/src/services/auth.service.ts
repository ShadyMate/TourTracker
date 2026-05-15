import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { environment } from '../environments/environment';

interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
}

/**
 * AuthService - login, registration, and session state.
 * On successful auth the backend returns a JWT which is stored in localStorage
 * and attached to every subsequent request by the auth interceptor.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private readonly API = environment.backendUrl;
  private readonly TOKEN_KEY = 'authToken';
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

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): number | null {
    const user = this.currentUser();
    return user ? parseInt(user.id, 10) : null;
  }

  async login(username: string, password: string): Promise<User> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.API}/users/login`, { username, password })
    );
    return this.applySession(response);
  }

  async register(username: string, password: string, email: string): Promise<User> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.API}/users/register`, { username, password, email })
    );
    return this.applySession(response);
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
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

  private applySession(response: AuthResponse): User {
    const user: User = {
      id: response.id.toString(),
      username: response.username,
      email: response.email ?? '',
      firstName: '',
      lastName: ''
    };
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem(this.TOKEN_KEY, response.token);
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
