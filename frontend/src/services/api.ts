import { Train, Journey, RouteGeometry, RouteWeatherResponse, ElevationProfileResponse, PlacePOI } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}: Request failed`);
  }
  return res.json();
}

export const api = {
  async searchTrains(query: string): Promise<Train[]> {
    const data = await fetchJSON<{ results: Train[] }>(`/trains/search?q=${encodeURIComponent(query)}`);
    return data.results;
  },


  async getLiveJourney(trainId: string): Promise<Journey> {
    return fetchJSON<Journey>(`/trains/${trainId}/live`);
  },

  async getRoute(trainId: string): Promise<RouteGeometry> {
    return fetchJSON<RouteGeometry>(`/trains/${trainId}/route`);
  },

  async getWeather(currLat: number, currLng: number, currName: string, nextLat: number, nextLng: number, nextName: string, destLat: number, destLng: number, destName: string): Promise<RouteWeatherResponse> {
    const params = new URLSearchParams({
      lat: currLat.toString(),
      lng: currLng.toString(),
      currName,
      nextLat: nextLat.toString(),
      nextLng: nextLng.toString(),
      nextName,
      destLat: destLat.toString(),
      destLng: destLng.toString(),
      destName
    });
    return fetchJSON<RouteWeatherResponse>(`/weather?${params.toString()}`);
  },

  async getElevation(routeId: string): Promise<ElevationProfileResponse> {
    return fetchJSON<ElevationProfileResponse>(`/routes/${routeId}/elevation`);
  },

  async getNearbyPlaces(routeId: string): Promise<PlacePOI[]> {
    const data = await fetchJSON<{ places: PlacePOI[] }>(`/places/near-route?routeId=${routeId}`);
    return data.places;
  },

  async createShareLink(trainId: string): Promise<{ token: string; expiresAt: string }> {
    return fetchJSON<{ token: string; expiresAt: string }>('/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainId })
    });
  },

  async getSharedJourney(token: string): Promise<{ shared: any; journey: Journey }> {
    return fetchJSON<{ shared: any; journey: Journey }>(`/share/${token}`);
  }
};
