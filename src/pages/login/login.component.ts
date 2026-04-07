import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // ViewModel state as signals
  isLoginMode = signal(true);
  email = signal('');
  password = signal('');
  firstName = signal('');
  lastName = signal('');
  loading = signal(false);
  error = signal('');

  // Computed properties for derived state
  isAuthenticated = computed(() => this.authService.isUserAuthenticated()());

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  toggleMode(): void {
    this.isLoginMode.update(mode => !mode);
    this.resetForm();
  }

  onEmailChange(value: string): void {
    this.email.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  onFirstNameChange(value: string): void {
    this.firstName.set(value);
  }

  onLastNameChange(value: string): void {
    this.lastName.set(value);
  }

  submit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    setTimeout(() => {
      try {
        if (this.isLoginMode()) {
          this.authService.login(this.email(), this.password());
        } else {
          this.authService.register(this.email(), this.password(), this.firstName(), this.lastName());
        }
        this.router.navigate(['/']);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        this.error.set(message);
        this.loading.set(false);
      }
    }, 500);
  }

  private validateForm(): boolean {
    if (!this.email() || !this.password()) {
      this.error.set('Email and password are required');
      return false;
    }

    if (!this.isValidEmail(this.email())) {
      this.error.set('Please enter a valid email address');
      return false;
    }

    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters');
      return false;
    }

    if (!this.isLoginMode()) {
      if (!this.firstName() || !this.lastName()) {
        this.error.set('First name and last name are required');
        return false;
      }
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private resetForm(): void {
    this.email.set('');
    this.password.set('');
    this.firstName.set('');
    this.lastName.set('');
    this.error.set('');
  }
}

