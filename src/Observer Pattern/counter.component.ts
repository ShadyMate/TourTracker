// counter.component.ts
import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterService } from './counter.service';

/**
 * COMPONENT AS OBSERVER:
 * =====================
 * This component demonstrates how components act as Observers in the
 * Angular signals-based Observer Pattern.
 *
 * Key Points:
 * 1. The component injects CounterService (the Subject)
 * 2. It reads signals synchronously (no subscription needed)
 * 3. It uses effect() to observe signal changes and run side effects
 * 4. Computed signals automatically notify dependents of changes
 * 5. No manual subscription/unsubscription needed - Angular handles cleanup
 */

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css']
})
export class CounterComponent implements OnInit {
  // OBSERVER: Inject the Subject (CounterService)
  constructor(private counterService: CounterService) {
    /**
     * EFFECT #1: Side Effect Observer
     * ================================
     * effect() is an Observer that runs whenever its dependencies change
     * Dependencies are tracked automatically when you read signals
     *
     * In traditional Observer Pattern terms:
     * - Subject: counterSignal (in CounterService)
     * - Observer: This effect function
     * - Notification: Automatic re-execution when counterSignal changes
     * - No manual subscription/unsubscription needed - Angular tracks component lifecycle
     */
    effect(() => {
      const counter = this.counterService.getCounter();
      console.log('Effect 1: Counter value changed to:', counter);
      // Could trigger animations, API calls, logging, etc.
    });

    /**
     * EFFECT #2: Another Observer
     * ===========================
     * Multiple effects can observe the same signal
     * Demonstrates multiple observers watching the same subject
     */
    effect(() => {
      const isEven = this.counterService.isEven();
      const squared = this.counterService.squaredValue();
      console.log(`Effect 2: Counter is ${isEven ? 'EVEN' : 'ODD'}, squared is ${squared}`);
      // This effect depends on TWO computed signals, which both depend on counterSignal
      // UPDATE PROPAGATION: Changes to counterSignal cascade down through all dependents
    });

    /**
     * EFFECT #3: Demonstrating Dependencies
     * ======================================
     * This effect shows how chained dependencies work
     * counterSignal -> squaredValue (computed) -> this effect
     * When counterSignal changes, squaredValue recalculates, then this effect runs
     */
    effect(() => {
      const isEvenSquare = this.counterService.isEvenSquare();
      console.log(`Effect 3: The squared value is ${isEvenSquare ? 'EVEN' : 'ODD'}`);
    });
  }

  ngOnInit(): void {
    console.log('CounterComponent initialized');
  }

  // Observable Properties (for Template Binding)
  // These are signals that the template can read directly
  // When the signal changes, the template automatically updates
  get counter() {
    return this.counterService.getCounter();
  }

  get isEven() {
    return this.counterService.isEven();
  }

  get squared() {
    return this.counterService.squaredValue();
  }

  get isEvenSquare() {
    return this.counterService.isEvenSquare();
  }

  // METHODS: Trigger updates to the subject
  increment(): void {
    this.counterService.increment();
    // UPDATE PROPAGATION in action:
    // 1. increment() calls counterSignal.update()
    // 2. counterSignal notifies all dependents (isEven, squaredValue computed signals)
    // 3. Those computed signals notify their dependents
    // 4. All effects re-run
    // 5. Component template updates with new values
    // All automatic - no manual $change detection needed!
  }

  decrement(): void {
    this.counterService.decrement();
  }

  reset(): void {
    this.counterService.reset();
  }

  setCustomValue(value: number): void {
    this.counterService.setValue(value);
  }
}
