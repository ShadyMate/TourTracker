import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private router = inject(Router);

  constructor() {
    this.router.navigate(['/login']);
  }
}

