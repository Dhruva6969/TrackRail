import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { trainProvider } from './providers/trainProvider.js';
import { weatherProvider } from './providers/weatherProvider.js';
import { elevationProvider } from './providers/elevationProvider.js';
import { placesProvider } from './providers/placesProvider.js';
import { shareProvider } from './providers/shareProvider.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Helper to safely parse string query param
function getQueryString(param: unknown, fallback: string = ''): string {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return fallback;
}

// 1. Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TrackRail API Gateway',
    version: '1.0.0'
  });
});

// 2. Search trains endpoint
app.get('/api/trains/search', async (req: Request, res: Response) => {
  try {
    const q = getQueryString(req.query.q).trim();
    if (q.length < 2) {
      return res.json({ results: [] });
    }
    const results = await trainProvider.searchTrains(q);
    res.json({ results });
  } catch (err: any) {
    console.error('[Backend] Search error:', err?.message || err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to search trains.' } });
  }
});

// 3. Live journey tracking endpoint
app.get('/api/trains/:trainId/live', async (req: Request, res: Response) => {
  const trainId = getQueryString(req.params.trainId).trim();
  console.log(`[Backend] Fetching live journey for train: ${trainId}`);
  try {
    const journey = await trainProvider.getLiveJourney(trainId);
    console.log(`[Backend] Successfully retrieved live journey for train ${trainId} (${journey.train.name})`);
    res.json(journey);
  } catch (err: any) {
    console.error(`[Backend] Live journey error for train ${trainId}:`, err?.message || err);
    res.status(404).json({
      error: {
        code: 'TRAIN_NOT_FOUND',
        message: err?.message || 'Live data unavailable for specified train.'
      }
    });
  }
});

// 4. Route geometry endpoint
app.get('/api/trains/:trainId/route', async (req: Request, res: Response) => {
  const trainId = getQueryString(req.params.trainId).trim();
  console.log(`[Backend] Fetching route geometry for train: ${trainId}`);
  try {
    const route = await trainProvider.getRoute(trainId);
    console.log(`[Backend] Successfully retrieved route for train ${trainId} (${route.stations.length} halts, ${route.geometry.coordinates.length} coords)`);
    res.json(route);
  } catch (err: any) {
    console.error(`[Backend] Route error for train ${trainId}:`, err?.message || err);
    res.status(404).json({
      error: {
        code: 'ROUTE_UNAVAILABLE',
        message: err?.message || 'Route geometry not found.'
      }
    });
  }
});

// 5. Weather endpoint
app.get('/api/weather', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(getQueryString(req.query.lat, '27.17'));
    const lng = parseFloat(getQueryString(req.query.lng, '78.00'));
    const currName = getQueryString(req.query.currName, 'Current Station');
    const nextLat = parseFloat(getQueryString(req.query.nextLat, '26.21'));
    const nextLng = parseFloat(getQueryString(req.query.nextLng, '78.18'));
    const nextName = getQueryString(req.query.nextName, 'Next Station');
    const destLat = parseFloat(getQueryString(req.query.destLat, '23.25'));
    const destLng = parseFloat(getQueryString(req.query.destLng, '77.41'));
    const destName = getQueryString(req.query.destName, 'Destination');

    const weather = await weatherProvider.getRouteWeather(
      lat, lng, currName,
      nextLat, nextLng, nextName,
      destLat, destLng, destName
    );

    res.json(weather);
  } catch (err) {
    console.error('Weather error:', err);
    res.status(500).json({ error: { code: 'WEATHER_UNAVAILABLE', message: 'Weather data unavailable.' } });
  }
});

// 6. Elevation profile endpoint
app.get('/api/routes/:routeId/elevation', async (req: Request, res: Response) => {
  try {
    const routeId = getQueryString(req.params.routeId);
    const elevation = await elevationProvider.getElevationProfile(routeId);
    res.json(elevation);
  } catch (err) {
    console.error('Elevation error:', err);
    res.status(500).json({ error: { code: 'ELEVATION_UNAVAILABLE', message: 'Elevation profile unavailable.' } });
  }
});

// 7. Nearby POIs endpoint
app.get('/api/places/near-route', async (req: Request, res: Response) => {
  try {
    const routeId = getQueryString(req.query.routeId, '12301');
    const places = await placesProvider.getNearbyPlaces(routeId);
    res.json({ places });
  } catch (err) {
    console.error('Places error:', err);
    res.status(500).json({ error: { code: 'PLACES_UNAVAILABLE', message: 'Places data unavailable.' } });
  }
});

// 8. Share endpoints
app.post('/api/share', async (req: Request, res: Response) => {
  try {
    const { trainId } = req.body;
    if (!trainId || typeof trainId !== 'string') {
      return res.status(400).json({ error: { code: 'INVALID_REQUEST', message: 'trainId is required.' } });
    }
    const shared = await shareProvider.createShareLink(trainId);
    res.json(shared);
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ error: { code: 'SHARE_FAILED', message: 'Failed to generate share link.' } });
  }
});

app.get('/api/share/:token', async (req: Request, res: Response) => {
  try {
    const token = getQueryString(req.params.token);
    const shared = await shareProvider.getShareLink(token);
    if (!shared) {
      return res.status(404).json({ error: { code: 'LINK_EXPIRED', message: 'Share link expired or invalid.' } });
    }
    const journey = await trainProvider.getLiveJourney(shared.trainId);
    res.json({ shared, journey });
  } catch (err) {
    console.error('Get shared journey error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve shared journey.' } });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TrackRail Backend Server running on http://localhost:${PORT}`);
});
