/**
 * Shared, generic data types used by the app.
 */
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  /** Departure time as a 'HH:mm' string. */
  departureTime: string;
  /** Arrival time as a 'HH:mm' string. */
  arrivalTime: string;
  /** Duration in minutes. */
  durationMinutes: number;
  /** Price in the given currency. */
  price: number;
  currency: string;
  /** Number of stops. */
  stops: number;
  /** Extra details about the stops (used on the flight detail page). */
  stopsDetails?: string[];
  /** Aircraft type used on this leg. */
  aircraftType?: string;
  /** Baggage allowance (e.g. '2 bags'). */
  baggageAllowance?: string;
  /** Seats still available on the flight. */
  seatsAvailable?: number;
}

export interface FlightFilters {
  priceMin: number;
  priceMax: number;
  /** Allowed values for `Flight.stops`. Empty array means "any stop count". */
  stops: number[];
  /** Allowed airline names. Empty array means "any airline". */
  airlines: string[];
  currency: string;
}
