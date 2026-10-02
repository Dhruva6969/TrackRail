import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Map as MapIcon, BarChart3, Compass, AlertCircle, RefreshCw, Train as TrainIcon, Mountain, CloudSun, X } from 'lucide-react';
import { useLiveJourney } from '../hooks/useLiveJourney';
import { useRoute, useElevation, useWeather, usePlaces } from '../hooks/useRouteData';
import { usePreferencesStore } from '../stores/preferencesStore';
import { LiveIndicator } from '../components/ui/LiveIndicator';
import { JourneyMap } from '../components/map/JourneyMap';
import { TrainSummaryCard } from '../components/train/TrainSummaryCard';
import { StationTimeline } from '../components/train/StationTimeline';
import { ElevationChart } from '../components/analytics/ElevationChart';
import { WeatherCard } from '../components/weather/WeatherCard';
import { ShareModal } from '../components/sharing/ShareModal';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const JourneyPage: React.FC = () => {
  const { trainId = '12301' } = useParams<{ trainId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'analytics' | 'weather' | 'places'>('analytics');
  const [shareOpen, setShareOpen] = useState(false);

  const { data: journey, isLoading, isError, refetch, isFetching } = useLiveJourney(trainId);
  const { data: route } = useRoute(trainId);
  const { data: elevation } = useElevation(trainId);
  const { data: weather } = useWeather(
    journey?.currentStation?.station.latitude,
    journey?.currentStation?.station.longitude,
    journey?.currentStation?.station.name,
    journey?.nextStation?.station.latitude,
    journey?.nextStation?.station.longitude,
    journey?.nextStation?.station.name,
    route?.stations[route.stations.length - 1]?.station.latitude,
    route?.stations[route.stations.length - 1]?.station.longitude,
    route?.stations[route.stations.length - 1]?.station.name
  );
  const { data: places = [] } = usePlaces(trainId);

  const { toggleFavourite, isFavourite } = usePreferencesStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="space-y-4 text-center max-w-sm w-full bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Connecting to Live Railway Telemetry</h3>
          <p className="text-xs text-slate-500">Loading GPS position, MapTiler vector basemap, and station route timeline...</p>
        </div>
      </div>
    );
  }

  if (isError || !journey) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md text-center max-w-sm w-full space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Live Data Temporarily Unavailable</h3>
          <p className="text-xs text-slate-500">We couldn't connect to the railway data server right now.</p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Back to Search
            </button>
            <button
              onClick={() => refetch()}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Delay trend chart data
  const delayChartData = route?.stations.map(s => ({
    name: s.station.code,
    delay: s.delayMinutes
  })) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16">
      
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand + Train Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
              title="Back to search"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold font-mono text-sm md:text-base text-slate-900 tracking-tight">
                  {journey.train.number}
                </span>
                <span className="font-bold text-sm md:text-base text-slate-800 truncate">
                  {journey.train.name}
                </span>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {journey.train.source} → {journey.train.destination} · <span className="font-mono">{journey.train.totalDistanceKm}</span> km
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block">
              <LiveIndicator updatedAt={journey.updatedAt} onRefresh={() => refetch()} isFetching={isFetching} />
            </div>

            <button
              onClick={() => toggleFavourite(journey.train)}
              className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-rose-500 transition-colors shadow-xs"
              title="Save to favourites"
            >
              <Heart className={`w-4 h-4 ${isFavourite(journey.train.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-xs transition-all shadow-[0_2px_8px_rgba(37,99,235,0.25)] flex items-center gap-1.5 active:scale-95"
              title="Share journey"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
              title="Close journey tracking"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* 2. TRAIN SUMMARY CARD (Horizontal Dashboard Card) */}
        <TrainSummaryCard journey={journey} />

        {/* 3. MAP + STATION TIMELINE (Strong Two-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT: Large Interactive MapLibre Map (7 or 8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <JourneyMap journey={journey} route={route} />
          </div>

          {/* RIGHT: Station Route Timeline (5 or 4 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4">
            {route?.stations ? (
              <StationTimeline
                stations={route.stations}
                currentStationCode={journey.currentStation?.station.code}
              />
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-400">
                Loading station timeline...
              </div>
            )}
          </div>

        </div>

        {/* 4. EXPANDED TRAVEL INTELLIGENCE TABS (Elevation, Weather, Landmarks) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-5 space-y-5">
          
          {/* Tab Navigation Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/60'
                }`}
              >
                <Mountain className="w-4 h-4 text-emerald-600" />
                <span>Elevation & Terrain</span>
              </button>

              <button
                onClick={() => setActiveTab('weather')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'weather'
                    ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/60'
                }`}
              >
                <CloudSun className="w-4 h-4 text-amber-500" />
                <span>Route Weather</span>
              </button>

              <button
                onClick={() => setActiveTab('places')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'places'
                    ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/60'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Nearby POIs ({places.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Ground Intelligence
            </span>
          </div>

          {/* Tab Content 1: Elevation Profile & Delay Trend */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ElevationChart data={elevation} currentDistanceKm={journey.distanceCoveredKm} />

              {/* Delay Trend Card */}
              <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Station Delay Propagation</h4>
                    <p className="text-[11px] text-slate-500">Recorded delay in minutes at scheduled halts</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                    journey.delayMinutes === 0
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : journey.delayMinutes > 0
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-blue-700 bg-blue-50 border-blue-200'
                  }`}>
                    {journey.delayMinutes === 0
                      ? 'On time'
                      : journey.delayMinutes > 0
                      ? `+${journey.delayMinutes} min`
                      : `${journey.delayMinutes} min`}
                  </span>
                </div>

                <div className="h-44 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={delayChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="delayFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} unit="m" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                        formatter={(value: any) => [`+${value} min`, 'Delay']}
                      />
                      <Area type="monotone" dataKey="delay" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#delayFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Weather */}
          {activeTab === 'weather' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <WeatherCard title="Current Station" weather={weather?.currentStationWeather} />
              <WeatherCard title="Next Station" weather={weather?.nextStationWeather} />
              <WeatherCard title="Destination" weather={weather?.destinationWeather} />
            </div>
          )}

          {/* Tab Content 3: Nearby Places */}
          {activeTab === 'places' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {places.map((poi) => (
                <div key={poi.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{poi.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {poi.distanceFromRouteKm} km
                    </span>
                  </div>
                  {poi.description && (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {poi.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        trainId={journey.train.id}
        trainName={`${journey.train.number} ${journey.train.name}`}
      />
    </div>
  );
};
