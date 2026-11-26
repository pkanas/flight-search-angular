/**
 * Feature service for the flight search feature.
 * Fetches flight data from the public mock REST API (databasesample.com)
 * and maps its DTO shape into the app's `Flight` model.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { InjectionToken, Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { Flight } from '../../../shared/models/flight.model';
import { FlightSearchParams } from '../models/flight-search.model';

/** Base URL for the public mock flights API. */
export const FLIGHT_API_URL = new InjectionToken<string>('FLIGHT_API_URL', {
  providedIn: 'root',
  factory: () => 'https://databasesample.com/mock/air-travel-insights/flights',
});

interface PublicApiAirlineDto {
  id: number;
  name: string;
  iata_code: string;
  country: string;
}

export interface PublicApiFlightDto {
  id: number;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  aircraft_model: string;
  airline_id: number;
  airline?: PublicApiAirlineDto;
}

/** Cached search data used to restore the search page after navigating away. */
interface CachedSearch {
  params: FlightSearchParams;
  flights: Flight[];
}

function formatTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Maps a `databasesample.com` flight record into the app's `Flight` model.
 * Fields missing from the public mock dataset (times, duration, price, stops)
 * are derived deterministically from `dto.id` so search and detail views match.
 */
function mapPublicFlight(dto: PublicApiFlightDto): Flight {
  const seed = Math.abs(dto.id) || 1;
  const departureMinutes = ((seed * 47) % 18 + 5) * 60 + ((seed * 15) % 4) * 15;
  const durationMinutes = 90 + ((seed * 37) % 240);
  const stops = seed % 3 === 0 ? 1 : 0;
  const price = 180 + ((seed * 73) % 720);

  return {
    id: String(dto.id),
    airline: dto.airline?.name ?? `Airline #${dto.airline_id}`,
    flightNumber: dto.flight_number,
    origin: dto.departure_airport,
    destination: dto.arrival_airport,
    departureTime: formatTime(departureMinutes),
    arrivalTime: formatTime(departureMinutes + durationMinutes),
    durationMinutes,
    price,
    currency: 'INR',
    stops,
    stopsDetails: stops > 0 ? ['1 layover en route'] : undefined,
    aircraftType: dto.aircraft_model,
    baggageAllowance: '1 checked bag + cabin bag',
    seatsAvailable: 4 + (seed % 18),
  };
}

@Injectable({ providedIn: 'root' })
export class FlightSearchService {
  private readonly http = inject(HttpClient);
  private readonly flightsUrl = inject(FLIGHT_API_URL);

  // The last search results are kept so the search page can be restored when
  // the user navigates back from the flight details page (the search page
  // component is destroyed during that navigation).
  private readonly cachedParams = signal<FlightSearchParams | null>(null);
  private readonly cachedFlights = signal<Flight[] | null>(null);

  /**
   * Fetches flights matching the search parameters from the public mock API.
   */
  searchFlights(params: FlightSearchParams): Observable<Flight[]> {
    const query = new HttpParams()
      .set('departure_airport', params.origin.trim().toUpperCase())
      .set('arrival_airport', params.destination.trim().toUpperCase())
      .set('_expand', 'airline')
      .set('_limit', '50');

    return this.http.get<PublicApiFlightDto[]>(this.flightsUrl, { params: query }).pipe(
      map((rows) => rows.map(mapPublicFlight)),
      tap((flights) => this.cacheResults(params, flights)),
    );
  }

  /** Fetches the details of a single flight by ID from the public mock API. */
  getFlightById(id: string): Observable<Flight> {
    const query = new HttpParams().set('_expand', 'airline');
    return this.http
      .get<PublicApiFlightDto>(`${this.flightsUrl}/${encodeURIComponent(id)}`, { params: query })
      .pipe(map(mapPublicFlight));
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
