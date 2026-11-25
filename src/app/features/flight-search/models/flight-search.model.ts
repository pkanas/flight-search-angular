/**
 * Types specific to the flight-search feature.
 */
import { Flight } from '../../../shared/models/flight.model';

/** Validated search request built from the search form. */
export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  /** Optional: omit for one-way searches. */
  returnDate?: string;
  passengers: number;
}

/** Shape of the stream that drives the search page UI. */
export interface FlightSearchState {
  flights: Flight[];
  loading: boolean;
  error: string | null;
  /** The search params of the latest (or in-flight) search, used for display. */
  searchParams: FlightSearchParams | null;
}
