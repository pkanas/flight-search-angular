import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { mockFlights } from './app/features/flight-search/data/mock-flights';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  // Allow local development hosts (localhost, 127.0.0.1).
  allowedHosts: ['localhost', '127.0.0.1'],
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Mock REST API used by the flight search feature.
 * `ng serve` and the production server both expose these endpoints.
 */
app.get('/api/flights', (req, res) => {
  const origin = typeof req.query['origin'] === 'string' ? req.query['origin'] : '';
  const destination =
    typeof req.query['destination'] === 'string' ? req.query['destination'] : '';

  const flights = mockFlights.filter(
    (flight) => flight.origin === origin && flight.destination === destination
  );

  res.json(flights);
});

app.get('/api/flights/:id', (req, res) => {
  const flight = mockFlights.find((f) => f.id === req.params['id']);
  if (!flight) {
    res.status(404).json({ error: 'Flight not found' });
    return;
  }
  res.json(flight);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
