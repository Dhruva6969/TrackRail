import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Gauge, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Journey, StationStop } from '../../types';
import { ElevationChart } from './ElevationChart';
import { useElevation } from '../../hooks/useRouteData';

interface AnalyticsViewProps {
  journey: Journey;
  stations?: StationStop[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ journey, stations = [] }) => {
  const { data: elevation } = useElevation(journey.train.id);

  // Prepare delay trend data across stations
  const delayData = stations.map(s => ({
    name: s.station.code,
    delay: s.delayMinutes
  }));

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards (Stripe Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface rounded-card p-4 border border-surface-tertiary shadow-apple space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-medium">Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-text-primary tracking-tight">
            {journey.progressPercentage}%
          </div>
          <div className="text-[11px] text-text-secondary">Journey completed</div>
        </div>

        <div className="bg-surface rounded-card p-4 border border-surface-tertiary shadow-apple space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-medium">Covered</span>
            <Gauge className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-text-primary tracking-tight">
            {journey.distanceCoveredKm} <span className="text-xs font-normal text-text-secondary">km</span>
          </div>
          <div className="text-[11px] text-text-secondary">Distance travelled</div>
        </div>

        <div className="bg-surface rounded-card p-4 border border-surface-tertiary shadow-apple space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-medium">Remaining</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-text-primary tracking-tight">
            {journey.distanceRemainingKm} <span className="text-xs font-normal text-text-secondary">km</span>
          </div>
          <div className="text-[11px] text-text-secondary">To destination</div>
        </div>

        <div className="bg-surface rounded-card p-4 border border-surface-tertiary shadow-apple space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-medium">Current Delay</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 tracking-tight">
            +{journey.delayMinutes} <span className="text-xs font-normal text-text-secondary">min</span>
          </div>
          <div className="text-[11px] text-text-secondary">Average delay</div>
        </div>
      </div>

      {/* Delay Trend Chart */}
      <div className="bg-surface rounded-card p-5 border border-surface-tertiary shadow-apple space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Delay Analysis Trend</h3>
            <p className="text-[11px] text-text-secondary">Recorded delay across stations (+ minutes)</p>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            +{journey.delayMinutes} min current
          </span>
        </div>

        <div className="h-40 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={delayData.length > 0 ? delayData : [
              { name: 'HWH', delay: 0 },
              { name: 'ASN', delay: 2 },
              { name: 'DHN', delay: 10 },
              { name: 'GAYA', delay: 12 },
              { name: 'DDU', delay: 18 },
              { name: 'PRYJ', delay: 18 },
              { name: 'CNB', delay: 20 },
              { name: 'NDLS', delay: 20 }
            ]}>
              <defs>
                <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6E6E73' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6E6E73' }} unit="m" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E5EA', fontSize: '12px' }}
                formatter={(value: any) => [`+${value} min`, 'Delay']}
              />
              <Area type="monotone" dataKey="delay" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#delayGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Elevation Terrain Profile Component */}
      <ElevationChart data={elevation} currentDistanceKm={journey.distanceCoveredKm} />
    </div>
  );
};
