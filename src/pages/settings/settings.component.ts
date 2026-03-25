import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  isDarkMode: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    // Subscribe to dark mode changes
    this.isDarkMode = this.authService.getDarkMode()();
  }

  toggleDarkMode() {
    this.authService.toggleDarkMode();
    this.isDarkMode = this.authService.getDarkMode()();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

