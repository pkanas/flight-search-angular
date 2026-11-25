/**
 * Shared, generic data types used by the app.
 */
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  price: number;
  currency: string;
  stops: number;
  stopsDetails?: string[];
  aircraftType?: string;
  baggageAllowance?: string;
  seatsAvailable?: number;
}

export interface FlightFilters {
  priceMin: number;
  priceMax: number;
  stops: number[];
  airlines: string[];
  currency: string;
}
