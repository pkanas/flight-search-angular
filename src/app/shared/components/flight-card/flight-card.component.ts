import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Flight } from '../../models/flight.model';
import { DurationPipe } from '../../pipes/duration.pipe';

/**
 * Reusable display of a single flight. Used by the search results list and by
 * the flight detail page (with extra details there).
 */
@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CurrencyPipe, DurationPipe],
  templateUrl: './flight-card.component.html',
  styleUrl: './flight-card.component.scss',
})
export class FlightCardComponent {
  readonly flight = input.required<Flight>();
  /** Emitted when the user clicks the card. */
  readonly flightSelected = output<Flight>();

  protected onSelect(): void {
    this.flightSelected.emit(this.flight());
  }
}
