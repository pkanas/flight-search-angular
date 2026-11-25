import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { Flight } from '../../../../shared/models/flight.model';
import { FlightSearchService } from '../../services/flight-search.service';

/**
 * Details page for a single flight: shows the flight summary plus the extra
 * details available (stops, aircraft, baggage allowance, seats).
 */
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

  /** The loaded flight; only read when not loading and without an error. */
  protected detail(): Flight {
    return this.flight() as Flight;
  }
}
