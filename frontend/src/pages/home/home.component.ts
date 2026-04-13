import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour.model';

/**
 * HomeComponent - ViewModel Layer
 *
 * MVVM Role: Acts as the ViewModel for the home/tours list view
 * - Manages component state using Angular signals (reactive primitives)
 * - Exposes reactive data streams that template can bind to
 * - Derives computed values (filteredTours) from base signals - automatically updated
 * - Delegates business logic to services (TourService, AuthService)
 * - Template uses binding syntax {{ }} for display and [(ngModel)] for two-way binding
 *
 * Data Binding Flow:
 * ┌─────────────────────────────────────────────────────────┐
 * │ 1. User types in search input                            │
 * │    ↓                                                      │
 * │ 2. [(ngModel)] updates searchQuery signal                │
 * │    ↓                                                      │
 * │ 3. searchQuery change detected by Angular                │
 * │    ↓                                                      │
 * │ 4. filteredTours computed() recalculates automatically   │
 * │    ↓                                                      │
 * │ 5. Template re-renders with new filtered list           │
 * └─────────────────────────────────────────────────────────┘
 *
 * Key MVVM Principles Demonstrated:
 * - State (tours) comes from service, not component
 * - Computed values update automatically (reactive)
 * - UI updates triggered by signal changes (not imperative DOM manipulation)
 * - Business logic stays in service, UI logic in component
 */
@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Performance optimization: only update on signal changes
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private tourService = inject(TourService);
  private router = inject(Router);

  // ═══════════════════════════════════════════════════════════════
  // VIEWMODEL STATE: Reactive signals bound to the template
  // ═══════════════════════════════════════════════════════════════

  // User input: search query entered in the search box
  // Updated via [(ngModel)] two-way binding on search input
  searchQuery = signal('');

  // Data source: all tours from the service
  // This is exposed as read-only to prevent accidental mutations
  tours = this.tourService.getTours();

  // Computed property: automatically filters tours based on search query
  // IMPORTANT: This is a "computed signal" - when tours() or searchQuery() change,
  // this automatically recalculates. No manual filter() calls needed.
  // The template watches this and automatically re-renders the list.
  filteredTours = computed(() =>
    this.tourService.filterTours(this.tours(), this.searchQuery())
  );

  // Authentication state for conditional UI rendering
  // Profile button redirects to /account if logged in, /login if not
  isLoggedIn = computed(() => this.authService.isUserAuthenticated()());

  ngOnInit(): void {
    // No initialization needed - services handle state automatically
    // Angular signals are initialized with service data already
  }

  /**
   * EVENT HANDLER: Search input changes
   * Updates the searchQuery signal, which triggers:
   * 1. filteredTours computed to recalculate
   * 2. Template to re-render with new filtered list
   * This demonstrates MVVM: view event → update signal → computed updates → template re-renders
   */
  onSearchInput(value: string): void {
    this.searchQuery.set(value.toLowerCase());
  }

  /**
   * ACTION: Add new tour
   * Navigation happens BEFORE component initializes
   * Tour details component will detect /tour/new in route and init empty form
   */
  addTour(): void {
    this.router.navigate(['/tour', 'new']);
  }

  /**
   * ACTION: View tour details
   * Navigate to tour details page to display/edit specific tour
   */
  goToTour(id: string): void {
    this.router.navigate(['/tour', id]);
  }

  /**
   * ACTION: Edit tour
   * Navigation includes edit query param
   * Tour details component checks queryParams and enables edit mode
   */
  editTour(tourId: string): void {
    this.router.navigate(['/tour', tourId], {
      queryParams: { edit: true }
    }).catch(err => {
      console.error('Navigation to tour edit failed:', err);
    });
  }

  /**
   * ACTION: Delete tour
   * 1. Confirm with user (prevent accidental deletion)
   * 2. Call service to delete from data store
   * 3. Service updates tours signal
   * 4. Computed filteredTours recalculates
   * 5. Template re-renders without the deleted tour
   * This demonstrates reactive deletion: service update → signal change → automatic UI update
   */
  deleteTour(tourId: string): void {
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return; // User cancelled
    }
    this.tourService.deleteTour(tourId);
    // No need to manually update UI - signal reactivity handles it
  }

  toggleFavorite(tourId: string): void {
    console.log('Toggle favorite:', tourId);
  }

  // ═══════════════════════════════════════════════════════════════
  // DISPLAY HELPERS: Delegate calculations to service
  // These methods call the service to compute display values
  // Separation of concerns: component requests data, service calculates
  // ═══════════════════════════════════════════════════════════════

  getPopularity(tour: Tour): number {
    return this.tourService.getPopularity(tour);
  }

  getAverageRating(tour: Tour): number {
    return this.tourService.getAverageRating(tour);
  }

  getRatingStars(rating: number): { full: number; half: boolean; empty: number } {
    return this.tourService.getRatingStars(rating);
  }

  getAverageActualTime(tour: Tour): string {
    return this.tourService.getAverageActualTime(tour);
  }

  getChildFriendliness(tour: Tour): number {
    return this.tourService.getChildFriendliness(tour);
  }

  getChildFriendlinessEmoji(score: number): string {
    return this.tourService.getChildFriendlinessEmoji(score);
  }

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION: Route to different pages
  // ═══════════════════════════════════════════════════════════════

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  /**
   * Smart profile button behavior
   * Shows different pages based on authentication state
   * MVVM: UI decision based on signal state (isLoggedIn)
   */
  goToProfile(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/account']); // Go to user profile if logged in
    } else {
      this.router.navigate(['/login']); // Go to login if not authenticated
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
