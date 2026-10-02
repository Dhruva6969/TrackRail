import { ElevationProfileResponse, ElevationPoint } from '../types/index.js';
import { trainProvider } from './trainProvider.js';

const OPENTOPODATA_URL = 'https://api.opentopodata.org/v1/srtm90m';

export class ElevationProvider {
  async getElevationProfile(routeId: string): Promise<ElevationProfileResponse> {
    try {
      const route = await trainProvider.getRoute(routeId);
      const allCoords = route.geometry.coordinates; // [lng, lat][]

      // Pick ~30 evenly-spaced points from the geometry
      const totalPoints = allCoords.length;
      const sampleCount = Math.min(30, totalPoints);
      const step = Math.max(1, Math.floor(totalPoints / sampleCount));
      const sampled: { lng: number; lat: number; distKm: number }[] = [];
      for (let i = 0; i < totalPoints; i += step) {
        const [lng, lat] = allCoords[i];
        const distKm = Math.round((i / Math.max(1, totalPoints - 1)) * route.distanceKm);
        sampled.push({ lng, lat, distKm });
      }
      // Always include last point
      const [lastLng, lastLat] = allCoords[totalPoints - 1];
      if (sampled[sampled.length - 1].distKm < route.distanceKm) {
        sampled.push({ lng: lastLng, lat: lastLat, distKm: route.distanceKm });
      }

      // Build locations string for OpenTopoData API
      const locStr = sampled.map(p => `${p.lat},${p.lng}`).join('|');
      const url = `${OPENTOPODATA_URL}?locations=${encodeURIComponent(locStr)}`;

      console.log(`[OpenTopoData] Requesting ${sampled.length} elevation points for route ${routeId}`);
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });

      if (!res.ok) {
        console.warn(`[OpenTopoData] Failed: HTTP ${res.status}, using simulated fallback`);
        return this.simulatedProfile(route.distanceKm, route.stations);
      }

      const data: { status: string; results: { elevation: number | null; location: { lat: number; lng: number } }[] } = await res.json();

      if (data.status !== 'OK' || !data.results?.length) {
        console.warn('[OpenTopoData] Bad response, using simulated fallback');
        return this.simulatedProfile(route.distanceKm, route.stations);
      }

      let highest = 0;
      let lowest = 9999;
      let totalGain = 0;
      let totalLoss = 0;
      let prevElev: number | null = null;

      const profile: ElevationPoint[] = data.results.map((r, idx) => {
        const elev = Math.max(1, Math.round(r.elevation ?? 100));
        if (elev > highest) highest = elev;
        if (elev < lowest) lowest = elev;
        if (prevElev !== null) {
          const diff = elev - prevElev;
          if (diff > 0) totalGain += diff;
          else totalLoss += Math.abs(diff);
        }
        prevElev = elev;

        const distKm = sampled[idx]?.distKm ?? 0;
        const matchingStation = route.stations.find(s =>
          Math.abs(s.distanceFromSourceKm - distKm) < (route.distanceKm / sampleCount / 2)
        );

        return {
          distanceKm: distKm,
          elevationMeters: elev,
          stationName: matchingStation?.station.name
        };
      });

      return { highestElevation: highest, lowestElevation: lowest, elevationGain: totalGain, elevationLoss: totalLoss, profile };

    } catch (err) {
      console.error(`[ElevationProvider] Error for ${routeId}:`, err);
      // Fall back to simulated profile so the UI doesn't break
      try {
        const route = await trainProvider.getRoute(routeId);
        return this.simulatedProfile(route.distanceKm, route.stations);
      } catch {
        return this.simulatedProfile(800, []);
      }
    }
  }

  private simulatedProfile(totalDist: number, stations: any[]): ElevationProfileResponse {
    const steps = 30;
    const profile: ElevationPoint[] = [];
    let highest = 0, lowest = 9999, totalGain = 0, totalLoss = 0, prevElev = 215;

    for (let i = 0; i <= steps; i++) {
      const dist = Math.round((i / steps) * totalDist);
      const baseElev = 200 + Math.sin((dist / totalDist) * Math.PI * 2) * 180 + Math.cos((dist / totalDist) * Math.PI * 4) * 80;
      const elev = Math.max(35, Math.round(baseElev));
      if (elev > highest) highest = elev;
      if (elev < lowest) lowest = elev;
      if (i > 0) {
        const diff = elev - prevElev;
        if (diff > 0) totalGain += diff;
        else totalLoss += Math.abs(diff);
      }
      prevElev = elev;
      const matchingStation = stations.find(s => Math.abs(s.distanceFromSourceKm - dist) < (totalDist / steps) / 2);
      profile.push({ distanceKm: dist, elevationMeters: elev, stationName: matchingStation?.station.name });
    }
    return { highestElevation: highest, lowestElevation: lowest, elevationGain: totalGain, elevationLoss: totalLoss, profile };
  }
}

export const elevationProvider = new ElevationProvider();
