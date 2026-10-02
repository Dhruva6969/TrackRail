import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useTrainSearch(query: string) {
  return useQuery({
    queryKey: ['trainSearch', query],
    queryFn: () => api.searchTrains(query),
    enabled: query.trim().length >= 2,
    staleTime: 15 * 60 * 1000 // 15 mins
  });
}
