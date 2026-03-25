import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Settings</h1>
      <p>Settings page - Coming soon!</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 40px 20px;
      text-align: center;
    }
  `]
})
export class SettingsComponent {}
