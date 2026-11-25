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
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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

  /** Combines the search state with the current filters into a stable signal. */
  readonly state = toSignal(
    this.searchState$.pipe(
      combineLatestWith(toObservable(this.filters)),
      map(([searchState, filters]) => ({
        ...searchState,
        flights: applyFilters(searchState.flights, filters),
      }))
    ),
    {
      initialValue: {
        flights: [] as Flight[],
        loading: false,
        error: null as string | null,
        searchParams: null as FlightSearchParams | null,
      },
    }
  );

  protected onSearchRequested(params: FlightSearchParams): void {
    this.searchTriggers$.next(params);
  }

  protected onFlightSelected(flight: Flight): void {
    this.router.navigate([`/flights/${flight.id}`]);
  }
}
