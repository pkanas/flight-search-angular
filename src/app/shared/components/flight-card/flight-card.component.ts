import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Flight } from '../../models/flight.model';
import { DurationPipe } from '../../pipes/duration.pipe';

/** Airline-specific brand colors for logo badges. */
const AIRLINE_COLORS: Record<string, string> = {
  'American Airlines': '#c4321a',
  'Delta': '#c4321a',
  'United': '#005DAA',
  'Southwest': '#304CB2',
  'Air France': '#002157',
  'British Airways': '#2E5090',
  'Lufthansa': '#05164D',
  'Emirates': '#D71921',
  'Qantas': '#E0162B',
  'Qatar Airways': '#5C0931',
  'Turkish Airlines': '#C70A0C',
  'Singapore Airlines': '#F7E44D',
};


@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CurrencyPipe, DurationPipe],
  templateUrl: './flight-card.component.html',
  styleUrl: './flight-card.component.scss',
})
export class FlightCardComponent {
  readonly flight = input.required<Flight>();
  readonly flightSelected = output<Flight>();

  protected get logoCode(): string {
    return this.flight()
      .airline.split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  protected get airlineColor(): string {
    return AIRLINE_COLORS[this.flight().airline] ?? '#2563eb';
  }

  protected onSelect(): void {
    this.flightSelected.emit(this.flight());
  }
}
