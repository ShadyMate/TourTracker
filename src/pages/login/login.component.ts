import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Login</h1>
      <p>Login page - Coming soon!</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 40px 20px;
      text-align: center;
    }
  `]
})
export class LoginComponent {}
