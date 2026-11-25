/**
 * The flight search page.
 *
 * Orchestration:
 * - `searchTriggers$` fires when the user submits a valid search form.
 * - `searchState$` switches to the feature service's `searchFlights()` call,
 *   so a new search cancels any in-flight one, and maps loading/error states.
 * - `rawState` converts `searchState$` to a signal, initialized from the
 *   service's cached search when navigating back from flight details.
 * - `state` is a `computed` signal combining `rawState` with the active
 *   `filters` (`applyFilters`).
 */
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { Flight, FlightFilters } from '../../shared/models/flight.model';
import { FlightSearchParams, FlightSearchState } from './models/flight-search.model';
import { DEFAULT_FILTERS, applyFilters } from '../../shared/utils/filters';
import { FlightSearchFormComponent } from './components/flight-search-form/flight-search-form.component';
import { FlightFiltersComponent } from './components/flight-filters/flight-filters.component';
import { FlightSearchResultsComponent } from './components/flight-search-results/flight-search-results.component';
import { FlightSearchService } from './services/flight-search.service';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [FlightSearchFormComponent, FlightFiltersComponent, FlightSearchResultsComponent],
  templateUrl: './flight-search.component.html',
  styleUrl: './flight-search.component.scss',
})
export class FlightSearchComponent {
  private readonly flightSearchService = inject(FlightSearchService);
  private readonly router = inject(Router);

  /** Emits each time the user submits a valid search form. */
  private readonly searchTriggers$ = new Subject<FlightSearchParams>();

  readonly filters = signal<FlightFilters>(DEFAULT_FILTERS);

  private readonly searchState$ = this.searchTriggers$.pipe(
    switchMap((params) =>
      this.flightSearchService.searchFlights(params).pipe(
        map(
          (flights): FlightSearchState => ({
            flights,
            loading: false,
            error: null,
            searchParams: params,
          }),
        ),
        startWith<FlightSearchState>({
          flights: [],
          loading: true,
          error: null,
          searchParams: params,
        }),
        catchError(
          (): Observable<FlightSearchState> =>
            of({
              flights: [],
              loading: false,
              error: 'Unable to load flights. Please try again.',
              searchParams: params,
            }),
        ),
      ),
    ),
  );

  /**
   * Unfiltered search state. Initialized from the service cache so navigating
   * back from the flight details page restores the last search without
   * re-fetching, while keeping `state` reactive to filter changes.
   */
  private readonly rawState = toSignal(this.searchState$, {
    initialValue: this.getInitialSearchState(),
  });

  /** The current UI state: filtered search results, loading, error + last search params. */
  readonly state = computed<FlightSearchState>(() => {
    const current = this.rawState();
    return {
      ...current,
      flights: applyFilters(current.flights, this.filters()),
    };
  });

  private getInitialSearchState(): FlightSearchState {
    const cached = this.flightSearchService.getCachedSearch();
    if (cached) {
      return {
        flights: cached.flights,
        loading: false,
        error: null,
        searchParams: cached.params,
      };
    }
    return {
      flights: [],
      loading: false,
      error: null,
      searchParams: null,
    };
  }

  protected onSearchRequested(params: FlightSearchParams): void {
    this.searchTriggers$.next(params);
  }

  protected onFlightSelected(flight: Flight): void {
    this.router.navigate([`/search/flights/${flight.id}`]);
  }
}
