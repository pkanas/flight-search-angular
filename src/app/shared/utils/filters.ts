import { Flight, FlightFilters } from '../models/flight.model';

/** Filters when the user has not touched them yet (no filtering applied). */
export const DEFAULT_FILTERS: FlightFilters = {
  priceMin: 0,
  priceMax: 1000,
  stops: [],
  airlines: [],
  currency: 'USD',
};

/**
 * Applies the given filters to a list of flights.
 * Empty `stops` / `airlines` arrays mean "no restriction".
 */
export function applyFilters(flights: Flight[], filters: FlightFilters): Flight[] {
  return flights.filter((flight) => {
    const inPriceRange = flight.price >= filters.priceMin && flight.price <= filters.priceMax;
    const allowedStops = filters.stops.length === 0 || filters.stops.includes(flight.stops);
    const allowedAirlines = filters.airlines.length === 0 || filters.airlines.includes(flight.airline);
    return inPriceRange && allowedStops && allowedAirlines;
  });
}
