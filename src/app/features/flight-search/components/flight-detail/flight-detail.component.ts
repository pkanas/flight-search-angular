import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { Flight } from '../../../../shared/models/flight.model';
import { FlightSearchService } from '../../services/flight-search.service';

const AIRPORT_LOCATIONS: Record<string, string> = {
  JFK: 'New York, USA',
  LAX: 'Los Angeles, USA',
  SFO: 'San Francisco, USA',
  SEA: 'Seattle, USA',
  LHR: 'London, UK',
  CDG: 'Paris, France',
  SIN: 'Singapore, Singapore',
  DXB: 'Dubai, UAE',
  BOM: 'Mumbai, India',
  FRA: 'Frankfurt, Germany',
  MUC: 'Munich, Germany',
  IST: 'Istanbul, Turkey',
  ORD: 'Chicago, USA',
  NRT: 'Tokyo, Japan',
};

const AIRLINE_COLORS: Record<string, string> = {
  'American Airlines': '#c4321a',
  Delta: '#c4321a',
  United: '#005DAA',
  Southwest: '#304CB2',
  'Air France': '#002157',
  'British Airways': '#2E5090',
  Lufthansa: '#05164D',
  Emirates: '#D71921',
  Qantas: '#E0162B',
  'Qatar Airways': '#5C0931',
  'Turkish Airlines': '#C70A0C',
  'Singapore Airlines': '#F7E44D',
};


@Component({
  selector: 'app-flight-detail',
  standalone: true,
  imports: [CurrencyPipe, DurationPipe, LoaderComponent],
  templateUrl: './flight-detail.component.html',
  styleUrl: './flight-detail.component.scss',
})
export class FlightDetailComponent {
  private readonly flightSearchService = inject(FlightSearchService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly flight = signal<Flight | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Flight not found.');
      this.loading.set(false);
      return;
    }

    this.flightSearchService.getFlightById(id).pipe(takeUntilDestroyed()).subscribe({
      next: (flight) => {
        this.flight.set(flight);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Flight details are not available.');
        this.loading.set(false);
      },
    });
  }

  
  protected detail(): Flight {
    return this.flight() as Flight;
  }


  protected airportLocation(code: string): string {
    return AIRPORT_LOCATIONS[code] ?? code;
  }


  protected stopsLabel(stops: number): string {
    if (stops === 0) {
      return 'Non-stop';
    }
    return `${stops} ${stops === 1 ? 'stop' : 'stops'}`;
  }

  /** Two-letter fallback badge for airlines without a custom vector mark. */
  protected airlineCode(airline: string): string {
    return airline
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }


  protected airlineColor(airline: string): string {
    return AIRLINE_COLORS[airline] ?? '#2563eb';
  }

  protected goBack(): void {
    this.router.navigate([`/search`]);
  }
}
