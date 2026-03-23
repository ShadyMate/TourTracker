import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal(false);

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  isUserAuthenticated() {
    return this.isAuthenticated.asReadonly();
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
}