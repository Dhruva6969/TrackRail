import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useLiveJourney(trainId: string) {
  return useQuery({
    queryKey: ['liveJourney', trainId],
    queryFn: () => api.getLiveJourney(trainId),
    enabled: Boolean(trainId),
    refetchInterval: 30000, // auto refresh every 30 seconds
    staleTime: 10000
  });
}
