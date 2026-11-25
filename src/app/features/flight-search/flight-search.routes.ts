import { Routes } from '@angular/router';

import { FlightDetailComponent } from './components/flight-detail/flight-detail.component';
import { FlightSearchComponent } from './flight-search.component';

/** Routes of the flight-search feature, mounted under 'search'. */
export const flightSearchRoutes: Routes = [
  { path: '', component: FlightSearchComponent },
  { path: 'flights/:id', component: FlightDetailComponent },
  { path: '**', redirectTo: '' },
];
