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

  isLoginMode = signal(true);
  username = signal('');
  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

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

  async submit(): Promise<void> {
    if (!this.validateForm()) return;

    this.loading.set(true);
    this.error.set('');

    try {
      if (this.isLoginMode()) {
        await this.authService.login(this.username(), this.password());
      } else {
        await this.authService.register(this.username(), this.password(), this.email());
      }
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials';
      this.error.set(message);
      this.loading.set(false);
    }
  }

  private validateForm(): boolean {
    if (!this.username() || !this.password()) {
      this.error.set('Username and password are required');
      return false;
    }
    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters');
      return false;
    }
    return true;
  }

  private resetForm(): void {
    this.username.set('');
    this.email.set('');
    this.password.set('');
    this.error.set('');
  }
}
