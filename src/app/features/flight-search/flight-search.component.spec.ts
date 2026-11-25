import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Flight } from '../../shared/models/flight.model';
import { DEFAULT_FILTERS } from '../../shared/utils/filters';
import { FlightSearchComponent } from './flight-search.component';
import { FlightSearchParams } from './models/flight-search.model';
import { FlightSearchService } from './services/flight-search.service';

describe('FlightSearchComponent', () => {
  const mockFlights: Flight[] = [
    {
      id: '1',
      airline: 'Delta',
      flightNumber: 'DL1',
      origin: 'JFK',
      destination: 'LAX',
      departureTime: '08:00',
      arrivalTime: '10:00',
      durationMinutes: 120,
      price: 150,
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
      price: 350,
      currency: 'INR',
      stops: 1,
    },
  ];

  const mockParams: FlightSearchParams = {
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '2026-12-01',
    returnDate: '',
    passengers: 1,
  };

  function setup(cached: { params: FlightSearchParams; flights: Flight[] } | null = null) {
    const flightSearchServiceMock = {
      getCachedSearch: jasmine.createSpy('getCachedSearch').and.returnValue(cached),
      searchFlights: jasmine.createSpy('searchFlights').and.returnValue(of(mockFlights)),
    };

    TestBed.configureTestingModule({
      imports: [FlightSearchComponent],
      providers: [
        provideRouter([]),
        { provide: FlightSearchService, useValue: flightSearchServiceMock },
      ],
    });

    const fixture = TestBed.createComponent(FlightSearchComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, flightSearchServiceMock };
  }

  it('applies filters to cached search results after navigating back from details', () => {
    const { component } = setup({ params: mockParams, flights: mockFlights });

    expect(component.state().searchParams).toEqual(mockParams);
    expect(component.state().flights.map((f) => f.id)).toEqual(['1', '2']);

    component.filters.set({ ...DEFAULT_FILTERS, stops: [1] });
    expect(component.state().flights.map((f) => f.id)).toEqual(['2']);

    component.filters.set({ ...DEFAULT_FILTERS, airlines: ['Delta'] });
    expect(component.state().flights.map((f) => f.id)).toEqual(['1']);

    component.filters.set({ ...DEFAULT_FILTERS });
    expect(component.state().flights.map((f) => f.id)).toEqual(['1', '2']);
  });

  it('allows subsequent searches after a search error', () => {
    const { component, flightSearchServiceMock } = setup();
    flightSearchServiceMock.searchFlights.and.returnValue(
      throwError(() => new Error('Network error')),
    );

    (component as unknown as { onSearchRequested(p: FlightSearchParams): void }).onSearchRequested(
      mockParams,
    );
    expect(component.state().error).toBe('Unable to load flights. Please try again.');

    flightSearchServiceMock.searchFlights.and.returnValue(of(mockFlights));
    (component as unknown as { onSearchRequested(p: FlightSearchParams): void }).onSearchRequested(
      mockParams,
    );
    expect(component.state().error).toBeNull();
    expect(component.state().flights.map((f) => f.id)).toEqual(['1', '2']);
  });
});
