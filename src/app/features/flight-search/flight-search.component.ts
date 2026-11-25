/**
 * The flight search page.
 *
 * Orchestration (all RxJS):
 * - `searchTriggers$` fires when the user submits a valid search form.
 * - `searchState$` switches to the feature service's `searchFlights()` call,
 *   so a new search cancels any in-flight one, and maps loading/error states.
 * - `state` is a signal combining the search state with the active filters
 *   (`applyFilters`).
 */
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  combineLatestWith,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

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
        })
      ),
    ),
    catchError((): Observable<FlightSearchState> =>
      of({
        flights: [],
        loading: false,
        error: 'Unable to load flights. Please try again.',
        searchParams: null,
      })
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** The current UI state: search results, loading, error + last search params. */
  readonly state = signal<FlightSearchState>({
    flights: [],
    loading: false,
    error: null,
    searchParams: null,
  });

  constructor() {
    // Restore the previous search results when the user navigates back from the
    // flight details page: the search page component is destroyed there, and
    // the cached data in the service survives the navigation.
    const cached = this.flightSearchService.getCachedSearch();
    if (cached) {
      this.state.set({
        flights: applyFilters(cached.flights, this.filters()),
        loading: false,
        error: null,
        searchParams: cached.params,
      });
    }

    // Forward the search stream state into the UI signal.
    this.searchState$
      .pipe(combineLatestWith(toObservable(this.filters)))
      .subscribe(([searchState, filters]) => {
        this.state.set({ ...searchState, flights: applyFilters(searchState.flights, filters) });
      });
  }

  protected onSearchRequested(params: FlightSearchParams): void {
    this.searchTriggers$.next(params);
  }

  protected onFlightSelected(flight: Flight): void {
    this.router.navigate([`/search/flights/${flight.id}`]);
  }
}
