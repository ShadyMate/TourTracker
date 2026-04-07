import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // ViewModel state using signals
  isLoading = signal(true);

  // Computed properties derived from service state
  user = computed(() => this.authService.getCurrentUser()());

  avatarInitials = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return '';
    const first = currentUser.firstName?.charAt(0).toUpperCase() || '';
    const last = currentUser.lastName?.charAt(0).toUpperCase() || '';
    return first + last;
  });

  ngOnInit(): void {
    if (!this.user()) {
      this.router.navigate(['/login']);
    }
    this.isLoading.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }
}

