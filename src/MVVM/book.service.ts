// book.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

// Model: Defines the data structure
export interface Book {
  id: number;
  title: string;
  author: string;
  pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // Model: Private state managed by the service
  private booksSubject = new BehaviorSubject<Book[]>([
    { id: 1, title: 'Angular Tutorial', author: 'Luis Boehler', pages: 400 },
    { id: 2, title: 'TypeScript Tutorial', author: 'Marvin Kosmider', pages: 350 }
  ]);

  // Expose model as Observable (reactive)
  books$ = this.booksSubject.asObservable();

  // Business logic method that operates on Model
  addBook(book: Book): void {
    const currentBooks = this.booksSubject.value;
    this.booksSubject.next([...currentBooks, book]);
  }

  // Business logic: Calculate average pages
  getAveragePages(): number {
    const books = this.booksSubject.value;
    return books.length > 0
      ? books.reduce((sum, book) => sum + book.pages, 0) / books.length
      : 0;
  }
}