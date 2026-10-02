import React from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';
import { WeatherCondition } from '../../types';

interface WeatherCardProps {
  title: string;
  weather?: WeatherCondition;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ title, weather }) => {
  if (!weather) {
    return (
      <div className="bg-surface rounded-card p-4 border border-surface-tertiary shadow-apple text-text-tertiary text-xs">
        Weather temporarily unavailable for {title}.
      </div>
    );
  }

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (c.includes('clear') || c.includes('sun')) return <Sun className="w-6 h-6 text-amber-500" />;
    return <Cloud className="w-6 h-6 text-slate-400" />;
  };

  return (
    <div className="bg-surface rounded-card p-5 border border-surface-tertiary shadow-apple space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</span>
        <span className="text-xs text-accent font-medium">{weather.locationName}</span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-secondary flex items-center justify-center">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary tracking-tight">
              {weather.temperature}°<span className="text-base font-normal text-text-secondary">C</span>
            </div>
            <div className="text-xs text-text-secondary">{weather.condition}</div>
          </div>
        </div>

        <div className="text-right text-xs space-y-1 text-text-secondary">
          <div className="flex items-center justify-end gap-1">
            <Thermometer className="w-3.5 h-3.5 text-text-tertiary" />
            <span>Feels like {weather.feelsLike}°</span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Droplets className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{weather.humidity}% humidity</span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Wind className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{weather.windSpeed} km/h wind</span>
          </div>
        </div>
      </div>
    </div>
  );
};
