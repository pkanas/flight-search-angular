# Flight Search Application (Angular)

A small, professional flight-search demo built with **Angular 20** (which satisfies the Angular 18+
requirement), TypeScript, Reactive Forms, REST integration via `HttpClient`, RxJS/Observables, Angular
Routing, reusable components, services, error handling, responsive UI and a clean folder structure.

The app is SSR-ready (server-side rendered at build time) and ships with a **local mock REST API**
served by the Express server (`/api/flights`).

## Folder structure

```
src/
├── app/
│   ├── app.ts / app.html / app.scss          # App shell (header, main, router outlet)
│   ├── app.routes.ts                         # Top-level routes (lazy feature loading)
│   ├── app.routes.server.ts                  # Server routes (SSR: search page prerendered)
│   ├── app.config.ts / app.config.server.ts   # App providers
│   ├── app.spec.ts
│   ├── shared/                               # Reusable, generic pieces
│   │   ├── models/flight.model.ts           # Flight, FlightFilters types
│   │   ├── pipes/duration.pipe.ts           # "4h 50m" formatting
│   │   ├── utils/filters.ts                 # DEFAULT_FILTERS + applyFilters()
│   │   ├── utils/date.utils.ts              # mustBeFutureDate() validator
│   │   └── components/flight-card/          # Reusable flight display (used in list + detail)
│   └── features/flight-search/               # The feature (lazy loaded under /search)
│       ├── flight-search.component.ts/html/scss   # Search page (RxJS orchestration)
│       ├── flight-search.routes.ts
│       ├── services/flight-search.service.ts      # HttpClient REST service
│       ├── models/flight-search.model.ts
│       ├── data/airlines.ts, data/mock-flights.ts # Mock data used by the local API
│       └── components/
│           ├── flight-search-form/          # Reactive form: From/To/Dates/Passengers
│           ├── flight-filters/              # Price range, stops, airline filters
│           ├── flight-search-results/       # Results list (loading/error/empty states)
│           └── flight-detail/               # Flight details page (route /search/flights/:id)
└── server.ts                                 # Express SSR server + mock REST API
```

## Features

- **Search form** — From, To, Departure date, optional Return date, Number of passengers, with
  Reactive Forms validations (required, min length, future dates, return date after departure, etc.).
- **REST API integration** — `FlightSearchService` uses `HttpClient` (`GET /api/flights`); served by
  the built-in Express server as a local/mock API using `mockFlights` (see `src/app/features/flight-search/data/`).
- **Loading and error states** — the results component shows a spinner, an error message
  ("Unable to load flights. Please try again.") and an empty state.
- **Results** — airline, flight number, departure time, arrival time, duration, price, stops.
- **Filters** — price range (min/max), number of stops, airline selection. Filters are applied with
  `applyFilters()` in `shared/utils/filters.ts`; they respond to input changes via Observables.
- **Flight details** — clicking a flight navigates to `/search/flights/:id`, where the details page
  shows extra information (aircraft, baggage allowance, seats, stops details).

## RxJS usage

The search page (`flight-search.component.ts`) orchestrates the search with a cold pipeline:

```ts
private readonly searchTriggers$ = new Subject<FlightSearchParams>();

private readonly searchState$ = this.searchTriggers$.pipe(
  switchMap((params) =>
    this.flightSearchService.searchFlights(params).pipe(
      map((flights) => ({ flights, loading: false, error: null })),
      startWith({ flights: [], loading: true, error: null }),
    ),
  ),
  catchError(() => of({ flights: [], loading: false, error: 'Unable to load flights. Please try again.' })),
  shareReplay({ bufferSize: 1, refCount: true }),
);

readonly state = toSignal(
  this.searchState$.pipe(
    combineLatestWith(toObservable(this.filters)),
    map(([searchState, filters]) => ({ ...searchState, flights: applyFilters(searchState.flights, filters) })),
  ),
);
```

A new search cancels any in-flight request (`switchMap`). Filters are combined with the results via
`combineLatest`.

## Run

```bash
npm install
npm start          # or: ng serve  (SSR dev server)
```

Then open http://localhost:4200 (dev) or http://localhost:4000 (production build, `npm run serve:ssr:flight-search-angular`).

## Build

```bash
npm run build      # browser + server bundles, prerenders the search page
```

## Tests

Unit tests for `applyFilters` and the `duration` pipe live in:

- `src/app/shared/utils/filters.spec.ts`
- `src/app/shared/pipes/duration.pipe.spec.ts`

Run them with `npm test` (requires a Chrome-based test runner).

## Mock API

The Express server exposes:

- `GET /api/flights?origin=JFK&destination=LAX` — flight list matching origin/destination (mock data).
- `GET /api/flights/:id` — details of a single flight.
