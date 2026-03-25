
MODEL (Service)                                              
- BookService manages books[] state                          
- Exposes books$ Observable                             
- Contains business logic (addBook, getAveragePages)       
               │ Observables emit new data
               ▼
VIEWMODEL (Component)
- Subscribes to books$ Observable
- Maintains books[], averagePages, form inputs
- Handles addNewBook() action
- Transforms Model data for View presentation

               │ Property binding {{ }}
               │ Two-way binding [(ngModel)]
               ▼
VIEW (Template)
- Displays books.length, averagePages
- Renders book list with *ngFor
- Captures user input via [(ngModel)]
- Calls addNewBook() via (click)
