// book-list.component.ts - ViewModel Layer in MVVM
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from './book.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit, OnDestroy {
  // ViewModel: Data bindings for the View
  books: Book[] = [];
  averagePages: number = 0;
  newBookTitle: string = '';
  newBookAuthor: string = '';
  newBookPages: number = 0;

  private destroy$ = new Subject<void>();

  // ViewModel: Inject the Model (Service)
  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // ViewModel: Subscribe to Model changes and update View data
    this.bookService.books$
      .pipe(takeUntil(this.destroy$))
      .subscribe((books) => {
        this.books = books; // Update ViewModel data
        this.averagePages = this.bookService.getAveragePages(); // Calculate derived data
      });
  }

  // ViewModel: Handle user actions (from View)
  addNewBook(): void {
    if (this.newBookTitle.trim() && this.newBookAuthor.trim() && this.newBookPages > 0) {
      const newBook: Book = {
        id: Date.now(), // Simple ID generation
        title: this.newBookTitle,
        author: this.newBookAuthor,
        pages: this.newBookPages
      };

      // ViewModel: Call Model method to update state
      this.bookService.addBook(newBook);

      // ViewModel: Reset form
      this.newBookTitle = '';
      this.newBookAuthor = '';
      this.newBookPages = 0;
    }
  }

  // ViewModel: Track by ID
  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}