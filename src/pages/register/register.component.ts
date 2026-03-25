import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Register page redirects to login component
// The login/register functionality is unified in the login component
// This component navigates to /login which displays the login component
@Component({
  selector: 'app-register',
  standalone: true,
  template: ''
})
export class RegisterComponent {
  constructor(private router: Router) {
    this.router.navigate(['/login']);
  }
}

