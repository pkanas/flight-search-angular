import { Component, input, output } from '@angular/core';

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
  readonly flightSelected = output<Flight>();
}
