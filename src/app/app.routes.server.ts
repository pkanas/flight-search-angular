import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'search', renderMode: RenderMode.Prerender },
  // Flight details are loaded from the local API, so they are rendered on the client.
  { path: 'search/flights/:id', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
