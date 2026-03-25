import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from '../MVVM/book-list.component';
import { CounterComponent } from '../Observer Pattern/counter.component';
import { ChatRoomComponent } from '../Mediator Pattern/chat-room.component';

// App: Root standalone component
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BookListComponent, CounterComponent, ChatRoomComponent],
  template: `
    <div class="app-container">
      <nav class="app-nav">
        <h1>Angular Tasks 1-3</h1>
        <p>Tasks MVVM, Observer and Mediator Patterns for Class 12</p>
      </nav>
      <div class="demos">
        <section class="demo-section">
          <h2>1. MVVM Pattern (Angular Components)</h2>
          <app-book-list></app-book-list>
        </section>
        <section class="demo-section">
          <h2>2. Observer Pattern (Angular Signals)</h2>
          <app-counter></app-counter>
        </section>
        <section class="demo-section">
          <h2>3. Mediator Pattern (Angular Templates)</h2>
          <app-chat-room></app-chat-room>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f3f4f6;
    }

    .app-nav {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }

    .app-nav h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }

    .app-nav p {
      margin: 0;
      font-size: 1.1em;
      opacity: 0.9;
    }

    .demos {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .demo-section {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .demo-section h2 {
      color: #667eea;
      margin-top: 0;
      border-bottom: 2px solid #667eea;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .app-nav {
        padding: 20px 10px;
      }

      .app-nav h1 {
        font-size: 1.8em;
      }

      .app-nav p {
        font-size: 1em;
      }

      .demos {
        padding: 20px 10px;
      }

      .demo-section {
        padding: 20px;
        margin-bottom: 30px;
      }
    }
  `]
})
export class App { }