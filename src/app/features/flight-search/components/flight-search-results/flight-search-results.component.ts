import { Component, computed, input, output, signal } from '@angular/core';

import { Flight } from '../../../../shared/models/flight.model';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { FlightCardComponent } from '../../../../shared/components/flight-card/flight-card.component';

/**
 * Displays the flight search results (or loading/error/empty states).
 * Clicking a flight emits it so the page can navigate to its details.
 */
@Component({
  selector: 'app-flight-search-results',
  standalone: true,
  imports: [FlightCardComponent, LoaderComponent],
  templateUrl: './flight-search-results.component.html',
  styleUrl: './flight-search-results.component.scss',
})
export class FlightSearchResultsComponent {
  readonly flights = input<Flight[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly departureDate = input<string | null>(null);
  readonly returnDate = input<string | null>(null);
  readonly flightSelected = output<Flight>();

  protected readonly sortKey = signal<string>('price-asc');

  protected readonly sortedFlights = computed(() => {
    const list = [...this.flights()];
    switch (this.sortKey()) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'duration-asc':
        return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
      case 'departure-asc':
        return list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      default:
        return list;
    }
  });

  protected get searchContext(): string {
    const dates = [
      this.departureDate() ? `Departure: ${this.departureDate()}` : null,
      this.returnDate() ? `Return: ${this.returnDate()}` : null,
    ].filter((part) => part !== null);
    return dates.join(' · ');
  }

  protected onSortChange(event: Event): void {
    this.sortKey.set((event.target as HTMLSelectElement).value);
  }
}
