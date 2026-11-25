/**
 * Feature service for the flight search feature.
 * All REST API calls go through HttpClient here.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Flight } from '../../../shared/models/flight.model';
import { FlightSearchParams } from '../models/flight-search.model';

/** Cached search data used to restore the search page after navigating away. */
interface CachedSearch {
  params: FlightSearchParams;
  flights: Flight[];
}

@Injectable({ providedIn: 'root' })
export class FlightSearchService {
  private readonly flightsUrl = '/api/flights';

  // The last search results are kept so the search page can be restored when
  // the user navigates back from the flight details page (the search page
  // component is destroyed during that navigation).
  private readonly cachedParams = signal<FlightSearchParams | null>(null);
  private readonly cachedFlights = signal<Flight[] | null>(null);

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches flights matching the search parameters.
   * The local/mock API (see src/server.ts) filters by origin and destination.
   */
  searchFlights(params: FlightSearchParams): Observable<Flight[]> {
    let query = new HttpParams()
      .set('origin', params.origin)
      .set('destination', params.destination)
      .set('departureDate', params.departureDate)
      .set('passengers', String(params.passengers));

    if (params.returnDate) {
      query = query.set('returnDate', params.returnDate);
    }

    return this.http.get<Flight[]>(this.flightsUrl, { params: query }).pipe(
      tap((flights) => this.cacheResults(params, flights)),
    );
  }

  /** Fetches the details of a single flight. */
  getFlightById(id: string): Observable<Flight> {
    return this.http.get<Flight>(`${this.flightsUrl}/${id}`);
  }

  /** Returns the last cached search results and params, if any. */
  getCachedSearch(): CachedSearch | null {
    const params = this.cachedParams();
    const flights = this.cachedFlights();
    return params && flights ? { params, flights } : null;
  }

  private cacheResults(params: FlightSearchParams, flights: Flight[]): void {
    this.cachedParams.set(params);
    this.cachedFlights.set(flights);
  }
}
