import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Tour Details</h1>
      <p>Tour details page - Coming soon!</p>
      @if (tourId) {
        <p>Tour ID: {{ tourId }}</p>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 40px 20px;
      text-align: center;
    }
  `]
})
export class TourDetailsComponent {
  tourId: string | null = null;

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(params => {
      this.tourId = params['id'];
    });
  }
}

