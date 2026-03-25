import { Component } from '@angular/core';
import { BookListComponent } from '../MVVM/book-list.component';

// App: Root standalone component
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookListComponent],
  template: `<app-book-list></app-book-list>`,
  styles: []
})
export class App { }