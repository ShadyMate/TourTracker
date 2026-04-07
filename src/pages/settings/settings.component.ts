import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // ViewModel state derived from service
  isDarkMode = computed(() => this.authService.getDarkMode()());

  toggleDarkMode(): void {
    this.authService.toggleDarkMode();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

