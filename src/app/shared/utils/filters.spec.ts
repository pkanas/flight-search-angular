import { DEFAULT_FILTERS, applyFilters } from './filters';
import { Flight } from '../models/flight.model';

describe('applyFilters', () => {
  const flights: Flight[] = [
    {
      id: '1',
      airline: 'Delta',
      flightNumber: 'DL1',
      origin: 'JFK',
      destination: 'LAX',
      departureTime: '08:00',
      arrivalTime: '10:00',
      durationMinutes: 120,
      price: 100,
      currency: 'INR',
      stops: 0,
    },
    {
      id: '2',
      airline: 'United',
      flightNumber: 'UA2',
      origin: 'JFK',
      destination: 'LAX',
      departureTime: '10:00',
      arrivalTime: '12:00',
      durationMinutes: 120,
      price: 250,
      currency: 'INR',
      stops: 1,
    },
  ];

  it('returns all flights when the default filters are used', () => {
    expect(applyFilters(flights, DEFAULT_FILTERS)).toHaveLength(2);
  });

  it('filters by price range', () => {
    const result = applyFilters(flights, { ...DEFAULT_FILTERS, priceMin: 200 });
    expect(result.map((f) => f.id)).toEqual(['2']);
  });

  it('filters by number of stops', () => {
    const result = applyFilters(flights, { ...DEFAULT_FILTERS, stops: [1] });
    expect(result.map((f) => f.id)).toEqual(['2']);
  });

  it('filters by airline', () => {
    const result = applyFilters(flights, { ...DEFAULT_FILTERS, airlines: ['Delta'] });
    expect(result.map((f) => f.id)).toEqual(['1']);
  });
});
