import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly searchText = signal('');

  protected onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.searchText.set(inputElement?.value ?? '');
  }

  protected function(): void {
    
  }
}