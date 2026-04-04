import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

/**
 * Account/Profile Page Component
 * Displays user information and account management options
 * Only shows when user is logged in
 */
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  user: User | null = null;
  isLoading = true;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Get current user from auth service
    this.user = this.authService.getCurrentUser()();

    // If not logged in, redirect to login
    if (!this.user) {
      this.router.navigate(['/login']);
    }

    this.isLoading = false;
  }

  /**
   * Generate avatar initials from user name
   */
  getAvatarInitials(): string {
    if (!this.user) return '';
    const first = this.user.firstName?.charAt(0).toUpperCase() || '';
    const last = this.user.lastName?.charAt(0).toUpperCase() || '';
    return first + last;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}

