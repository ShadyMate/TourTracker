import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoginMode = true;
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // If already logged in, redirect to home
    if (this.authService.isUserAuthenticated()()) {
      this.router.navigate(['/']);
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.resetForm();
  }

  submit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = '';

    setTimeout(() => {
      try {
        if (this.isLoginMode) {
          this.authService.login(this.email, this.password);
        } else {
          this.authService.register(this.email, this.password, this.firstName, this.lastName);
        }
        this.router.navigate(['/']);
      } catch (err: any) {
        this.error = err.message || 'An error occurred';
        this.loading = false;
      }
    }, 500);
  }

  private validateForm(): boolean {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.error = 'Please enter a valid email address';
      return false;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return false;
    }

    if (!this.isLoginMode) {
      if (!this.firstName || !this.lastName) {
        this.error = 'First name and last name are required';
        return false;
      }
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private resetForm() {
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.error = '';
  }
}

