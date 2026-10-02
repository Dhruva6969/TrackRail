import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useRoute(trainId: string) {
  return useQuery({
    queryKey: ['routeGeometry', trainId],
    queryFn: () => api.getRoute(trainId),
    enabled: Boolean(trainId),
    staleTime: 24 * 60 * 60 * 1000 // 24 hours
  });
}

export function useWeather(
  currLat?: number, currLng?: number, currName?: string,
  nextLat?: number, nextLng?: number, nextName?: string,
  destLat?: number, destLng?: number, destName?: string
) {
  return useQuery({
    queryKey: ['routeWeather', currLat, currLng, nextLat, nextLng, destLat, destLng],
    queryFn: () => api.getWeather(
      currLat || 27.17, currLng || 78.00, currName || 'Current Station',
      nextLat || 26.21, nextLng || 78.18, nextName || 'Next Station',
      destLat || 23.25, destLng || 77.41, destName || 'Destination'
    ),
    enabled: Boolean(currLat && currLng),
    staleTime: 15 * 60 * 1000
  });
}

export function useElevation(routeId: string) {
  return useQuery({
    queryKey: ['elevationProfile', routeId],
    queryFn: () => api.getElevation(routeId),
    enabled: Boolean(routeId),
    staleTime: 7 * 24 * 60 * 60 * 1000
  });
}

export function usePlaces(routeId: string) {
  return useQuery({
    queryKey: ['nearbyPlaces', routeId],
    queryFn: () => api.getNearbyPlaces(routeId),
    enabled: Boolean(routeId),
    staleTime: 24 * 60 * 60 * 1000
  });
}
