// counter.service.ts
import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

/**
 * OBSERVER PATTERN EXPLAINED:
 *
 * In the classic Observer Pattern:
 * - SUBJECT: Maintains state and notifies observers of changes
 * - OBSERVERS: Listen for state changes from the subject
 * - UPDATE PROPAGATION: Subject notifies observers automatically
 *
 * How Angular Signals Implement This:
 * ====================================
 * SUBJECT (CounterService):
 *   - Uses signal() to create a reactive state container
 *   - The signal holds the counter value and tracks all dependents
 *   - When the signal changes, all dependents are automatically notified
 *
 * OBSERVERS (Computed & Effects in Component):
 *   - computed() creates dependent signals that automatically recalculate
 *   - effect() subscribes to signal changes and runs side effects
 *   - Both are "observers" that react to the subject's state changes
 *
 * UPDATE PROPAGATION (Fine-grained Reactivity):
 *   - When setCounter() is called, the signal emits a change
 *   - Angular tracks which components depend on this signal
 *   - Only those components re-evaluate (no global change detection)
 *   - This is more efficient than traditional RxJS observables
 */

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  // SUBJECT: The signal acts as the Subject in the Observer Pattern
  // It holds mutable state and notifies all dependents when it changes
  private counterSignal = signal<number>(0);

  // Public accessor to read the signal value
  // Signals are synchronous, so you can read them directly
  getCounter = this.counterSignal.asReadonly();

  // OBSERVER #1 (Computed Signal):
  // A dependent computation that automatically updates when counterSignal changes
  // This is an Observer because it watches the subject (counterSignal)
  isEven = computed(() => {
    const counter = this.counterSignal(); // Subscribe to signal by reading it
    return counter % 2 === 0; // Auto-recalculated whenever counterSignal changes
  });

  // OBSERVER #2 (Another Computed Signal):
  // Demonstrates how multiple observers can depend on the same subject
  squaredValue = computed(() => {
    const counter = this.counterSignal(); // Subscribe to signal
    return counter * counter; // Auto-recalculated on signal change
  });

  // OBSERVER #3 (Another Computed Signal):
  // Shows chaining - this observer depends on another observer
  isEvenSquare = computed(() => {
    const squared = this.squaredValue(); // Subscribe to computed signal
    return squared % 2 === 0; // Re-evaluates when squaredValue changes
  });

  // Methods to update the subject (trigger notifications)
  increment(): void {
    // When we update the signal, all observers are automatically notified
    // UPDATE PROPAGATION: The signal change triggers updates in computed()
    // and effects() that depend on it
    this.counterSignal.update(value => value + 1);
  }

  decrement(): void {
    this.counterSignal.update(value => value - 1);
  }

  reset(): void {
    // Directly set the signal value
    // UPDATE PROPAGATION: All observers will re-evaluate
    this.counterSignal.set(0);
  }

  setValue(value: number): void {
    this.counterSignal.set(value);
  }
}
