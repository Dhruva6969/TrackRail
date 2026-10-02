import React from 'react';
import { Compass, Landmark, Mountain, Waves, Navigation2, Building2 } from 'lucide-react';
import { Journey, PlacePOI } from '../../types';
import { WeatherCard } from '../weather/WeatherCard';
import { useWeather, usePlaces } from '../../hooks/useRouteData';

interface CompanionViewProps {
  journey: Journey;
}

export const CompanionView: React.FC<CompanionViewProps> = ({ journey }) => {
  const { data: weather } = useWeather(
    journey.currentStation?.station.latitude,
    journey.currentStation?.station.longitude,
    journey.currentStation?.station.name,
    journey.nextStation?.station.latitude,
    journey.nextStation?.station.longitude,
    journey.nextStation?.station.name,
    journey.nextStation?.station.latitude,
    journey.nextStation?.station.longitude,
    journey.train.destination || 'Destination'
  );

  const { data: places = [] } = usePlaces(journey.train.id);

  const getPOIIcon = (type: string) => {
    switch (type) {
      case 'river':
      case 'lake':
        return <Waves className="w-4 h-4 text-cyan-600" />;
      case 'mountain':
        return <Mountain className="w-4 h-4 text-emerald-600" />;
      case 'bridge':
      case 'tunnel':
        return <Navigation2 className="w-4 h-4 text-indigo-600" />;
      case 'monument':
        return <Landmark className="w-4 h-4 text-amber-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Weather Intelligence Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
          <Compass className="w-4 h-4 text-accent" />
          <span>Route Weather Intelligence</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <WeatherCard title="Current Station" weather={weather?.currentStationWeather} />
          <WeatherCard title="Next Station" weather={weather?.nextStationWeather} />
          <WeatherCard title="Destination" weather={weather?.destinationWeather} />
        </div>
      </div>

      {/* Nearby Geographic POIs Section */}
      <div className="bg-surface rounded-card p-5 border border-surface-tertiary shadow-apple space-y-4">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">Nearby Geographic Landmarks</h3>
          <p className="text-[11px] text-text-secondary">Monuments, rivers, ghats, and bridges along your rail corridor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {places.map((poi: PlacePOI) => (
            <div key={poi.id} className="p-3.5 rounded-2xl bg-surface-secondary/70 border border-surface-tertiary/60 hover:bg-surface-secondary transition-colors flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white shadow-sm border border-black/5">
                {getPOIIcon(poi.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-text-primary">{poi.name}</span>
                  <span className="text-[11px] font-medium text-text-secondary bg-white px-2 py-0.5 rounded-full border border-black/5">
                    {poi.distanceFromRouteKm} km away
                  </span>
                </div>
                {poi.description && (
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {poi.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
