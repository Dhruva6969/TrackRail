import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Share2, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { JourneyMap } from '../components/map/JourneyMap';
import { JourneyProgress } from '../components/train/JourneyProgress';
import { DelayBadge } from '../components/ui/Badge';
import { LiveIndicator } from '../components/ui/LiveIndicator';
import { StationTimeline } from '../components/train/StationTimeline';
import { useRoute } from '../hooks/useRouteData';

export const SharedJourneyPage: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sharedJourney', token],
    queryFn: async () => {
      // If token starts with demo-, pull live journey directly
      if (token.startsWith('demo-')) {
        const trainId = token.replace('demo-', '');
        const journey = await api.getLiveJourney(trainId);
        return { journey };
      }
      return api.getSharedJourney(token);
    },
    refetchInterval: 30000
  });

  const journey = data?.journey;
  const { data: route } = useRoute(journey?.train?.id || '12301');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-6">
        <div className="text-center text-xs text-text-secondary">Loading shared journey...</div>
      </div>
    );
  }

  if (isError || !journey) {
    return (
      <div className="min-h-screen bg-surface-secondary flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h3 className="font-bold text-text-primary text-base">Shared Journey Expired or Link Invalid</h3>
        <p className="text-xs text-text-secondary max-w-xs">Shared tracking links expire after 48 hours.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs"
        >
          Track a Train on TrackRail
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary pb-12">
      {/* Header Banner */}
      <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm">
        <ShieldCheck className="w-4 h-4" />
        <span>You are viewing a shared live journey link on TrackRail</span>
      </div>

      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-surface-tertiary px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-text-primary">{journey.train.number}</span>
                <span className="font-semibold text-sm text-text-primary">{journey.train.name}</span>
              </div>
              <div className="text-[11px] text-text-secondary">{journey.train.source} → {journey.train.destination}</div>
            </div>
          </div>

          <LiveIndicator updatedAt={journey.updatedAt} onRefresh={() => refetch()} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <JourneyMap journey={journey} route={route} />
            <JourneyProgress
              progressPercentage={journey.progressPercentage}
              distanceCoveredKm={journey.distanceCoveredKm}
              distanceRemainingKm={journey.distanceRemainingKm}
              sourceName={journey.train.source}
              destinationName={journey.train.destination}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface rounded-card p-5 border border-surface-tertiary shadow-apple space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary uppercase">Live Telemetry</span>
                <DelayBadge status={journey.status} delayMinutes={journey.delayMinutes} />
              </div>
              <div className="text-lg font-bold text-text-primary">
                Near {journey.currentStation?.station.name || 'En Route'}
              </div>
            </div>

            {route?.stations && <StationTimeline stations={route.stations} currentStationCode={journey.currentStation?.station.code} />}
          </div>
        </div>
      </main>
    </div>
  );
};
