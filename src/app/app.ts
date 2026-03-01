import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  filterToursByQuery,
  summarizeTours,
  TOURS,
  type TourItem,
  type TourStats,
} from './services/tour-data';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Read-only source data used by the computed view-model values below.
  protected readonly tours: readonly TourItem[] = TOURS;

  // User-provided search query from the input field.
  protected readonly searchText = signal('');

  // Derived, filtered list that updates whenever searchText changes.
  protected readonly filteredTours = computed<TourItem[]>(() =>
    filterToursByQuery(this.tours, this.searchText()),
  );

  // Derived summary values for the currently filtered list.
  protected readonly filteredTourStats = computed<TourStats>(() =>
    summarizeTours(this.filteredTours()),
  );

  // Keeps searchText signal in sync with user input events.
  protected onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.searchText.set(inputElement?.value ?? '');
  }
}