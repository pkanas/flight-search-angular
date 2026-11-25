import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'search',
    loadChildren: () =>
      import('./features/flight-search/flight-search.routes').then((m) => m.flightSearchRoutes),
  },
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: '**', redirectTo: 'search' },
];
