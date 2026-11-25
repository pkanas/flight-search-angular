import { Component, input, output } from '@angular/core';
import { FlightFilters } from '../../../../shared/models/flight.model';
import { AIRLINES } from '../../data/airlines';
import { DEFAULT_FILTERS } from '../../../../shared/utils/filters';

/**
 * Filters applied to the search results: price range, number of stops and
 * airline. Emits a new `FlightFilters` on every change.
 */
@Component({
  selector: 'app-flight-filters',
  standalone: true,
  templateUrl: './flight-filters.component.html',
  styleUrl: './flight-filters.component.scss',
})
export class FlightFiltersComponent {
  readonly filters = input.required<FlightFilters>();
  readonly filtersChange = output<FlightFilters>();

  /** Options for the "number of stops" checkboxes. */
  protected readonly stopOptions = [0, 1, 2, 3];
  /** airlines selectable in the UI (from the mock data). */
  protected readonly airlines = AIRLINES;

  /** Labels for stop options matching the reference design. */
  protected readonly stopLabels: Record<number, string> = {
    0: 'Non-stop',
    1: '1 Stop',
    2: '2+ Stops',
    3: '3+ Stops',
  };

  /** Search term for airline filter. */
  protected airlineSearchTerm = '';

  /** Airlines filtered by the search term. */
  protected get filteredAirlines(): string[] {
    if (!this.airlineSearchTerm) {
      return this.airlines;
    }
    const term = this.airlineSearchTerm.toLowerCase();
    return this.airlines.filter((a) => a.toLowerCase().includes(term));
  }

  protected onAirlineSearch(event: Event): void {
    this.airlineSearchTerm = (event.target as HTMLInputElement).value;
  }

  protected onClearAll(): void {
    this.filtersChange.emit({ ...DEFAULT_FILTERS });
  }

  protected onPriceMin(event: Event): void {
    this.emit({ priceMin: this.numberInput(event) });
  }

  protected onPriceMax(event: Event): void {
    this.emit({ priceMax: this.numberInput(event) });
  }

  protected onStopsToggle(value: number, checked: boolean): void {
    const stops = checked
      ? [...this.filters().stops, value]
      : this.filters().stops.filter((stop) => stop !== value);
    this.emit({ stops });
  }

  protected onAirlineToggle(airline: string, checked: boolean): void {
    const airlines = checked
      ? [...this.filters().airlines, airline]
      : this.filters().airlines.filter((name) => name !== airline);
    this.emit({ airlines });
  }

  private numberInput(event: Event): number {
    const value = Number((event.target as HTMLInputElement).valueAsNumber);
    return Number.isFinite(value) ? value : 0;
  }

  private emit(patch: Partial<FlightFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...patch });
  }
}
