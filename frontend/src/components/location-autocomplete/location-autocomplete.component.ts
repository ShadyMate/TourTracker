import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapService } from '../../services/map.service';

export interface LocationSuggestion {
  label: string;
  coords: [number, number]; // [lat, lng]
}

/**
 * LocationAutocompleteComponent - Reusable address input with ORS autocomplete dropdown
 *
 * Emits locationSelected when user picks a suggestion (includes resolved coordinates).
 * Emits textChange when the user types freely (no coordinates yet).
 */
@Component({
  selector: 'app-location-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="autocomplete-wrapper" (keydown)="onKeydown($event)">
      <input
        type="text"
        class="autocomplete-input"
        [placeholder]="placeholder"
        [value]="inputValue"
        (input)="onInput($event)"
        (focus)="onFocusInput()"
        (blur)="onBlur()"
        autocomplete="off"
        [attr.aria-label]="placeholder"
        [attr.aria-expanded]="showDropdown && suggestions().length > 0"
        aria-autocomplete="list"
      />
      @if (isLoading()) {
        <span class="autocomplete-spinner" aria-hidden="true"></span>
      }
      @if (showDropdown && suggestions().length > 0) {
        <ul class="autocomplete-dropdown" role="listbox">
          @for (s of suggestions(); track s.label; let i = $index) {
            <li
              class="autocomplete-option"
              [class.highlighted]="i === activeIndex"
              role="option"
              [attr.aria-selected]="i === activeIndex"
              (mousedown)="selectSuggestion(s)"
            >
              <span class="option-icon">📍</span>
              {{ s.label }}
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .autocomplete-wrapper {
      position: relative;
      width: 100%;
    }

    .autocomplete-input {
      width: 100%;
      padding: 8px 32px 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      background: #fff;
      transition: border-color 0.2s;
    }

    .autocomplete-input:focus {
      border-color: #4a90e2;
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.15);
    }

    .autocomplete-spinner {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      border: 2px solid #e0e0e0;
      border-top-color: #4a90e2;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      pointer-events: none;
    }

    @keyframes spin {
      to { transform: translateY(-50%) rotate(360deg); }
    }

    .autocomplete-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      list-style: none;
      margin: 0;
      padding: 4px 0;
      z-index: 1000;
      max-height: 220px;
      overflow-y: auto;
    }

    .autocomplete-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      transition: background 0.1s;
    }

    .autocomplete-option:hover,
    .autocomplete-option.highlighted {
      background: #f0f6ff;
      color: #1a73e8;
    }

    .option-icon {
      flex-shrink: 0;
      font-size: 12px;
      opacity: 0.7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationAutocompleteComponent implements OnInit, OnDestroy {
  private mapService = inject(MapService);
  private cdr = inject(ChangeDetectorRef);

  @Input() placeholder = 'Search location...';
  @Input() set initialValue(val: string) {
    if (val !== this._lastSelected) {
      this.inputValue = val;
    }
  }

  @Output() locationSelected = new EventEmitter<LocationSuggestion>();
  @Output() textChange = new EventEmitter<string>();

  inputValue = '';
  showDropdown = false;
  activeIndex = -1;

  suggestions = signal<LocationSuggestion[]>([]);
  isLoading = signal(false);

  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private _lastSelected = '';
  // Prevent re-triggering autocomplete after programmatic selection
  private _skipNextInput = false;

  ngOnInit(): void {
    this.input$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(text => {
          if (text.length < 2) {
            this.suggestions.set([]);
            this.isLoading.set(false);
            return of([]);
          }
          this.isLoading.set(true);
          return this.mapService.geocodeAutocomplete(text);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        this.isLoading.set(false);
        this.suggestions.set(results as LocationSuggestion[]);
        this.showDropdown = (results as LocationSuggestion[]).length > 0;
        this.activeIndex = -1;
        this.cdr.markForCheck();
      });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue = value;
    this.textChange.emit(value);

    if (this._skipNextInput) {
      this._skipNextInput = false;
      return;
    }
    this.input$.next(value);
  }

  onFocusInput(): void {
    if (this.suggestions().length > 0) {
      this.showDropdown = true;
    }
  }

  onBlur(): void {
    // Small delay so mousedown on option fires before blur hides dropdown
    setTimeout(() => {
      this.showDropdown = false;
      this.cdr.markForCheck();
    }, 150);
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.suggestions().length;
    if (!this.showDropdown || count === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % count;
        this.cdr.markForCheck();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = (this.activeIndex - 1 + count) % count;
        this.cdr.markForCheck();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectSuggestion(this.suggestions()[this.activeIndex]);
        }
        break;
      case 'Escape':
        this.showDropdown = false;
        this.cdr.markForCheck();
        break;
    }
  }

  selectSuggestion(suggestion: LocationSuggestion): void {
    this._lastSelected = suggestion.label;
    this.inputValue = suggestion.label;
    this.showDropdown = false;
    this.suggestions.set([]);
    this.activeIndex = -1;
    this.locationSelected.emit(suggestion);
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
