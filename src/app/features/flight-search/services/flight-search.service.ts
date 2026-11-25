/**
 * Feature service for the flight search feature.
 * All REST API calls go through HttpClient here.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Flight } from '../../../shared/models/flight.model';
import { FlightSearchParams } from '../models/flight-search.model';

@Injectable({ providedIn: 'root' })
export class FlightSearchService {
  private readonly flightsUrl = '/api/flights';

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

    return this.http.get<Flight[]>(this.flightsUrl, { params: query });
  }

  /** Fetches the details of a single flight. */
  getFlightById(id: string): Observable<Flight> {
    return this.http.get<Flight>(`${this.flightsUrl}/${id}`);
  }
}
