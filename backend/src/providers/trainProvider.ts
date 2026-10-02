import 'dotenv/config';
import { Train, Journey, RouteGeometry, StationStop, TrainPosition } from '../types/index.js';

const RAILRADAR_BASE = 'https://api.railradar.in/v1';

/** Directory of premier Indian trains for instant search by name / partial string */
const PREMIER_TRAINS_CATALOG: Train[] = [
  { id: '12951', number: '12951', name: 'Mumbai Central - New Delhi Tejas Rajdhani Express', source: 'Mumbai Central (MMCT)', destination: 'New Delhi (NDLS)', totalDistanceKm: 1386, type: 'Rajdhani' },
  { id: '12301', number: '12301', name: 'Howrah - New Delhi Rajdhani Express', source: 'Howrah Jn (HWH)', destination: 'New Delhi (NDLS)', totalDistanceKm: 1451, type: 'Rajdhani' },
  { id: '12002', number: '12002', name: 'New Delhi - Rani Kamlapati Shatabdi Express', source: 'New Delhi (NDLS)', destination: 'Rani Kamlapati (RKMP)', totalDistanceKm: 708, type: 'Shatabdi' },
  { id: '22436', number: '22436', name: 'New Delhi - Varanasi Vande Bharat Express', source: 'New Delhi (NDLS)', destination: 'Varanasi Jn (BSB)', totalDistanceKm: 759, type: 'Vande Bharat' },
  { id: '12626', number: '12626', name: 'New Delhi - Thiruvananthapuram Kerala Express', source: 'New Delhi (NDLS)', destination: 'Thiruvananthapuram (TVC)', totalDistanceKm: 3035, type: 'Superfast' },
  { id: '12953', number: '12953', name: 'Mumbai Central - Hazrat Nizamuddin August Kranti Rajdhani Express', source: 'Mumbai Central (MMCT)', destination: 'Hazrat Nizamuddin (NZM)', totalDistanceKm: 1386, type: 'Rajdhani' },
  { id: '12424', number: '12424', name: 'New Delhi - Dibrugarh Rajdhani Express', source: 'New Delhi (NDLS)', destination: 'Dibrugarh (DBRG)', totalDistanceKm: 2426, type: 'Rajdhani' },
  { id: '12004', number: '12004', name: 'New Delhi - Lucknow Shatabdi Express', source: 'New Delhi (NDLS)', destination: 'Lucknow Jn (LJN)', totalDistanceKm: 512, type: 'Shatabdi' },
  { id: '12259', number: '12259', name: 'Sealdah - Bikaner AC Duronto Express', source: 'Sealdah (SDAH)', destination: 'Bikaner Jn (BKN)', totalDistanceKm: 1913, type: 'Duronto' },
  { id: '12431', number: '12431', name: 'Thiruvananthapuram - Hazrat Nizamuddin Rajdhani Express', source: 'Thiruvananthapuram (TVC)', destination: 'Hazrat Nizamuddin (NZM)', totalDistanceKm: 2848, type: 'Rajdhani' },
  { id: '20801', number: '20801', name: 'Islampur - New Delhi Magadh Express', source: 'Islampur (IPR)', destination: 'New Delhi (NDLS)', totalDistanceKm: 1065, type: 'Superfast' },
  { id: '12801', number: '12801', name: 'Puri - New Delhi Purushottam Express', source: 'Puri (PURI)', destination: 'New Delhi (NDLS)', totalDistanceKm: 1864, type: 'Superfast' },
  { id: '12137', number: '12137', name: 'Mumbai CSMT - Firozpur Punjab Mail', source: 'Mumbai CSMT (CSMT)', destination: 'Firozpur Cantt (FZR)', totalDistanceKm: 1928, type: 'Express' },
  { id: '12615', number: '12615', name: 'Chennai Central - New Delhi Grand Trunk Express', source: 'Chennai Central (MAS)', destination: 'New Delhi (NDLS)', totalDistanceKm: 2182, type: 'Superfast' },
  { id: '12621', number: '12621', name: 'Chennai Central - New Delhi Tamil Nadu Express', source: 'Chennai Central (MAS)', destination: 'New Delhi (NDLS)', totalDistanceKm: 2182, type: 'Superfast' }
];

/** Raw RailRadar station entry from /v1/trains/{number} route array */
interface RRStation {
  sequence: number;
  station: { code: string; name: string; lat: number; lng: number };
  isHalt: boolean;
  platform?: string;
  arrival?: string;
  departure?: string;
  arrivalDay?: number;
  departureDay?: number;
  distance: number;
  speedToNextStationKmph?: number;
  isReversal?: boolean;
}

/** Raw RailRadar live route entry from /v1/trains/{number}/live */
interface RRLiveStation {
  sequence: number;
  stationCode: string;
  stationName: string;
  isHalt: boolean;
  status: 'departed' | 'at-station' | 'approaching' | 'upcoming';
  scheduledArrival?: string;
  scheduledDeparture?: string;
  actualArrival?: string;
  actualDeparture?: string;
  delayArrival?: number;
  delayDeparture?: number;
  platform?: string;
  distance: number;
  speedToNextStationKmph?: number;
  provenance?: string;
}

interface RRTrain {
  number: string;
  name: string;
  type: string;
  category?: string;
  source: { code: string; name: string; lat: number; lng: number };
  destination: { code: string; name: string; lat: number; lng: number };
  distance: number;
  duration?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  totalHalts?: number;
}

interface RRScheduleResponse {
  success: boolean;
  data: {
    train: RRTrain;
    route: RRStation[];
  };
}

interface RRLiveResponse {
  success: boolean;
  data: {
    trainNumber: string;
    trainName: string;
    startDate: string;
    lastUpdatedAt: string;
    status: string;
    train: RRTrain;
    isLive: boolean;
    trackingMode: string;
    previousHalt?: { stationCode: string; stationName: string; sequence: number; distance: number };
    nextHalt?: { stationCode: string; stationName: string; sequence: number; distance: number };
    delayMinutes: number;
    currentLocation: {
      stationCode: string;
      stationName: string;
      sequence: number;
      status: string;
      isHalt: boolean;
      distanceFromOriginKm: number;
      distanceFromLastStationKm?: number;
      segmentProgress?: number;
      speedKmh?: number;
      delayMinutes: number;
    };
    route: RRLiveStation[];
  };
}

interface RRRouteResponse {
  success: boolean;
  data: {
    trainNumber: string;
    format: string;
    geojson: {
      type: 'Feature';
      geometry: {
        type: 'LineString';
        coordinates: [number, number][];
      };
    };
  };
}

/** Formats a time string into 24-hr HH:mm without returning NaN */
function formatTime(val?: string): string {
  if (!val) return '--:--';
  const clean = val.trim();
  // Already in HH:mm or HH:mm:ss format
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(clean)) {
    return clean.substring(0, 5);
  }
  // ISO 8601 string containing time portion like T17:00:00+05:30
  const match = clean.match(/T(\d{2}:\d{2})/);
  if (match) {
    return match[1];
  }
  try {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
  } catch {}
  return clean;
}

function mapLiveStatus(rrStatus: string): 'COMPLETED' | 'CURRENT' | 'UPCOMING' {
  switch (rrStatus) {
    case 'departed': return 'COMPLETED';
    case 'at-station':
    case 'approaching': return 'CURRENT';
    default: return 'UPCOMING';
  }
}

/** Interpolates real GPS position along route stations using distanceFromOriginKm */
function interpolatePosition(
  allStations: RRStation[],
  distKm: number
): { lat: number; lng: number; bearing: number; speedKmh: number } {
  if (!allStations || allStations.length === 0) {
    return { lat: 20.5937, lng: 78.9629, bearing: 0, speedKmh: 80 };
  }

  let prevIdx = 0;
  for (let i = 0; i < allStations.length; i++) {
    if (allStations[i].distance <= distKm) prevIdx = i;
    else break;
  }

  const nextIdx = Math.min(allStations.length - 1, prevIdx + 1);
  const prev = allStations[prevIdx];
  const next = allStations[nextIdx];

  const segLen = next.distance - prev.distance;
  const ratio = segLen > 0 ? Math.min(1, Math.max(0, (distKm - prev.distance) / segLen)) : 0;

  const lat = prev.station.lat + (next.station.lat - prev.station.lat) * ratio;
  const lng = prev.station.lng + (next.station.lng - prev.station.lng) * ratio;
  const dLat = next.station.lat - prev.station.lat;
  const dLng = next.station.lng - prev.station.lng;
  const bearing = Math.round((Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360);
  const speedKmh = Math.round(prev.speedToNextStationKmph ?? 80);

  return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)), bearing, speedKmh };
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class TrainProvider {
  private cache = new Map<string, CacheEntry<any>>();

  private getCached<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }
    return undefined;
  }

  private getStale<T>(key: string): T | undefined {
    return this.cache.get(key)?.data as T | undefined;
  }

  private setCached<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  private get apiKey(): string {
    return process.env.RAILRADAR_API_KEY || '';
  }

  private async rrFetch<T>(endpoint: string, ttlMs = 30000): Promise<T> {
    const cached = this.getCached<T>(endpoint);
    if (cached) {
      console.log(`[TrainProvider] Cache hit for ${endpoint}`);
      return cached;
    }

    const key = this.apiKey;
    if (!key) {
      console.error('[TrainProvider] RAILRADAR_API_KEY is not defined in environment!');
      throw new Error('RAILRADAR_API_KEY not configured');
    }
    const url = `${RAILRADAR_BASE}${endpoint}`;
    console.log(`[TrainProvider] Calling RailRadar API: ${url} (Key: ${key.slice(0, 6)}...)`);
    
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (res.status === 429) {
        console.warn(`[TrainProvider] RailRadar rate limit (429) on ${endpoint}`);
        const stale = this.getStale<T>(endpoint);
        if (stale) {
          console.warn(`[TrainProvider] Serving stale cached data for ${endpoint}`);
          return stale;
        }
      }

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`[TrainProvider] RailRadar API error ${res.status} on ${endpoint}: ${body.substring(0, 200)}`);
        const stale = this.getStale<T>(endpoint);
        if (stale) {
          console.warn(`[TrainProvider] Serving stale data on error for ${endpoint}`);
          return stale;
        }
        throw new Error(`RailRadar HTTP ${res.status}: ${body.substring(0, 200)}`);
      }

      const json = await res.json() as T;
      this.setCached(endpoint, json, ttlMs);
      return json;
    } catch (err: any) {
      const stale = this.getStale<T>(endpoint);
      if (stale) {
        console.warn(`[TrainProvider] Network error, serving stale data for ${endpoint}:`, err?.message);
        return stale;
      }
      throw err;
    }
  }

  /**
   * Search trains by train number or name.
   * - If numeric query (3-5 digits): Queries RailRadar directly.
   * - If text query: Matches against Premier Trains directory (max 4 results).
   */
  async searchTrains(query: string): Promise<Train[]> {
    const q = query.trim();
    if (!q) return [];
    console.log(`[TrainProvider] Searching trains for query: "${q}"`);

    // 1. If query is numeric (train number)
    const digits = q.replace(/\D/g, '');
    if (digits.length >= 3) {
      try {
        const data = await this.rrFetch<RRScheduleResponse>(`/trains/${digits}`, 2 * 60 * 60 * 1000);
        if (data.success && data.data?.train) {
          const liveTrain = this.mapTrain(data.data.train);
          console.log(`[TrainProvider] Direct RailRadar match for train ${digits}: ${liveTrain.name}`);
          return [liveTrain];
        }
      } catch (err: any) {
        console.warn(`[TrainProvider] Direct lookup for "${digits}" failed on RailRadar:`, err?.message);
      }
    }

    // 2. Search catalog by train number or name (limit to 4 results)
    const lower = q.toLowerCase();
    const catalogMatches = PREMIER_TRAINS_CATALOG.filter(t =>
      t.number.includes(lower) || t.name.toLowerCase().includes(lower) || t.source.toLowerCase().includes(lower) || t.destination.toLowerCase().includes(lower)
    ).slice(0, 4);

    return catalogMatches;
  }

  /**
   * Get route geometry and halt stations for any train.
   */
  async getRoute(trainId: string): Promise<RouteGeometry> {
    console.log(`[TrainProvider] Fetching route and geometry for train ${trainId}`);
    
    let scheduleData: RRScheduleResponse;
    let geoData: RRRouteResponse | null = null;
    let liveData: RRLiveResponse | null = null;

    try {
      // Fetch schedule and GeoJSON in parallel (schedule is cached 2h)
      const [sRes, gRes] = await Promise.allSettled([
        this.rrFetch<RRScheduleResponse>(`/trains/${trainId}`, 2 * 60 * 60 * 1000),
        this.rrFetch<RRRouteResponse>(`/trains/${trainId}/route`, 2 * 60 * 60 * 1000)
      ]);

      if (sRes.status !== 'fulfilled') {
        throw sRes.reason;
      }
      scheduleData = sRes.value;

      if (gRes.status === 'fulfilled') {
        geoData = gRes.value;
      }
    } catch (err: any) {
      console.error(`[TrainProvider] getRoute failed for ${trainId}:`, err?.message);
      throw err;
    }

    const rrTrain = scheduleData.data.train;
    const rrRoute = scheduleData.data.route;
    const train = this.mapTrain(rrTrain);

    // Use complete station/stop list from RailRadar route (do not limit to commercial halts)
    const stations: StationStop[] = rrRoute.map(s => {
      const scheduledArrival = formatTime(s.arrival);
      const scheduledDeparture = formatTime(s.departure);

      return {
        station: {
          id: s.station.code,
          code: s.station.code,
          name: s.station.name,
          latitude: s.station.lat,
          longitude: s.station.lng,
          state: undefined
        },
        sequence: s.sequence,
        scheduledArrival,
        scheduledDeparture,
        status: 'UPCOMING',
        delayMinutes: 0,
        distanceFromSourceKm: Math.round(s.distance),
        platform: s.platform
      };
    });

    // High-density GeoJSON coordinates from route endpoint, or fall back to schedule coordinates
    const coordinates: [number, number][] =
      geoData?.data?.geojson?.geometry?.coordinates ||
      rrRoute.map(s => [s.station.lng, s.station.lat] as [number, number]);

    return {
      distanceKm: train.totalDistanceKm,
      stations,
      geometry: {
        type: 'LineString',
        coordinates
      }
    };
  }

  /**
   * Get real-time live journey telemetry for any train.
   */
  async getLiveJourney(trainId: string): Promise<Journey> {
    console.log(`[TrainProvider] Fetching live telemetry for train ${trainId}`);
    
    let liveData: RRLiveResponse | null = null;
    let scheduleData: RRScheduleResponse;

    try {
      const [lRes, sRes] = await Promise.allSettled([
        this.rrFetch<RRLiveResponse>(`/trains/${trainId}/live`, 25 * 1000),
        this.rrFetch<RRScheduleResponse>(`/trains/${trainId}`, 2 * 60 * 60 * 1000)
      ]);

      if (sRes.status !== 'fulfilled') {
        throw sRes.reason;
      }
      scheduleData = sRes.value;

      if (lRes.status === 'fulfilled') {
        liveData = lRes.value;
      } else {
        console.warn(`[TrainProvider] Live endpoint unfulfilled for ${trainId}, falling back to schedule basis`);
      }
    } catch (err: any) {
      console.error(`[TrainProvider] getLiveJourney critical error for ${trainId}:`, err?.message);
      throw err;
    }

    const schedule = scheduleData.data;
    const live = liveData?.data;
    const rrTrain = live?.train || schedule.train;
    const train = this.mapTrain(rrTrain);

    // Complete station list from schedule route (do not filter to halts only)
    const scheduleHalts = schedule.route;

    // Live stations mapping
    const liveMap = new Map<string, RRLiveStation>();
    if (live?.route) {
      for (const ls of live.route) {
        liveMap.set(ls.stationCode, ls);
      }
    }

    const haltStops: StationStop[] = scheduleHalts.map(s => {
      const liveInfo = liveMap.get(s.station.code);
      return {
        station: {
          id: s.station.code,
          code: s.station.code,
          name: s.station.name,
          latitude: s.station.lat,
          longitude: s.station.lng,
          state: undefined
        },
        sequence: s.sequence,
        scheduledArrival: formatTime(s.arrival || liveInfo?.scheduledArrival),
        scheduledDeparture: formatTime(s.departure || liveInfo?.scheduledDeparture),
        actualArrival: liveInfo?.actualArrival ? formatTime(liveInfo.actualArrival) : undefined,
        actualDeparture: liveInfo?.actualDeparture ? formatTime(liveInfo.actualDeparture) : undefined,
        status: liveInfo ? mapLiveStatus(liveInfo.status) : 'UPCOMING',
        delayMinutes: liveInfo?.status === 'departed'
          ? Math.abs(liveInfo?.delayDeparture ?? liveInfo?.delayArrival ?? 0)
          : (live?.delayMinutes ?? Math.abs(liveInfo?.delayArrival ?? 0)),
        distanceFromSourceKm: Math.round(s.distance),
        platform: s.platform || liveInfo?.platform
      };
    });

    // Determine distance covered
    const currentLoc = live?.currentLocation;
    const distanceCovered = Math.round(currentLoc?.distanceFromOriginKm ?? 0);
    const distanceRemaining = Math.max(0, train.totalDistanceKm - distanceCovered);
    const progressPercentage = Math.min(100, Math.round((distanceCovered / Math.max(1, train.totalDistanceKm)) * 100));

    // Interpolate live GPS position along the full 200+ schedule stations
    const { lat, lng, bearing, speedKmh } = interpolatePosition(schedule.route, distanceCovered);

    // Speed: Use live reported speed or 0 if train has not started (rounded to integer)
    let realSpeed = 0;
    if (live?.status === 'not-started') {
      realSpeed = 0;
    } else if (typeof currentLoc?.speedKmh === 'number') {
      realSpeed = Math.round(currentLoc.speedKmh);
    } else {
      realSpeed = Math.round(speedKmh);
    }

    // Determine currentStation, nextStation, and previousStation
    let currentStation: StationStop | undefined;
    let nextStation: StationStop | undefined;
    let previousStation: StationStop | undefined;

    if (currentLoc) {
      currentStation = haltStops.find(s => s.station.code === currentLoc.stationCode);
      if (!currentStation && currentLoc.stationName) {
        currentStation = {
          station: {
            id: currentLoc.stationCode,
            code: currentLoc.stationCode,
            name: currentLoc.stationName,
            latitude: lat,
            longitude: lng
          },
          sequence: currentLoc.sequence,
          scheduledArrival: '--:--',
          scheduledDeparture: '--:--',
          status: 'CURRENT',
          delayMinutes: Math.abs(currentLoc.delayMinutes ?? live?.delayMinutes ?? 0),
          distanceFromSourceKm: distanceCovered
        };
      }
    }
    if (!currentStation) {
      currentStation = haltStops.find(s => s.status === 'CURRENT')
        || haltStops.filter(s => s.status === 'COMPLETED').slice(-1)[0]
        || haltStops[0];
    }

    if (live?.nextHalt) {
      nextStation = haltStops.find(s => s.station.code === live.nextHalt?.stationCode);
    }
    if (!nextStation) {
      nextStation = haltStops.find(s => s.status === 'UPCOMING') || haltStops[haltStops.length - 1];
    }

    if (live?.previousHalt) {
      previousStation = haltStops.find(s => s.station.code === live.previousHalt?.stationCode);
    }

    const delayMinutes = live?.delayMinutes ?? 0;
    const status = delayMinutes > 5 ? 'DELAYED' : delayMinutes < -1 ? 'EARLY' : 'ON_TIME';

    const position: TrainPosition = {
      latitude: lat,
      longitude: lng,
      speedKmh: realSpeed,
      bearing,
      timestamp: live?.lastUpdatedAt || new Date().toISOString()
    };

    return {
      train,
      status,
      delayMinutes,
      currentStation,
      nextStation,
      previousStation,
      position,
      progressPercentage,
      distanceCoveredKm: distanceCovered,
      distanceRemainingKm: distanceRemaining,
      updatedAt: live?.lastUpdatedAt || new Date().toISOString()
    };
  }

  private mapTrain(t: RRTrain): Train {
    return {
      id: t.number,
      number: t.number,
      name: t.name,
      source: `${t.source.name} (${t.source.code})`,
      destination: `${t.destination.name} (${t.destination.code})`,
      totalDistanceKm: Math.round(t.distance),
      type: t.type || 'Express'
    };
  }
}

export const trainProvider = new TrainProvider();
