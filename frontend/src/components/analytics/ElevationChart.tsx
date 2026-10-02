import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Mountain } from 'lucide-react';
import { ElevationProfileResponse } from '../../types';

interface ElevationChartProps {
  data?: ElevationProfileResponse;
  currentDistanceKm?: number;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({ data, currentDistanceKm = 842 }) => {
  if (!data || !data.profile || data.profile.length === 0) {
    return (
      <div className="bg-surface rounded-card p-6 border border-surface-tertiary shadow-apple text-center text-text-secondary text-xs">
        Elevation data unavailable for this route.
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-card p-5 border border-surface-tertiary shadow-apple space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Terrain & Elevation Profile</h3>
            <p className="text-[11px] text-text-secondary">Route elevation along track distance</p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="font-bold text-text-primary">{data.highestElevation} m</span>
          <span className="text-[11px] text-text-secondary block">Peak Elevation</span>
        </div>
      </div>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.profile} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="distanceKm" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6E6E73' }} unit="km" />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6E6E73' }} unit="m" />
            <Tooltip
              contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E5EA', fontSize: '12px' }}
              formatter={(value: any) => [`${value} m`, 'Elevation']}
              labelFormatter={(label: any) => `${label} km from origin`}
            />
            <Area type="monotone" dataKey="elevationMeters" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#elevationGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-surface-tertiary text-xs">
        <div>
          <span className="text-text-tertiary text-[10px] uppercase font-medium block">Highest</span>
          <span className="font-semibold text-text-primary">{data.highestElevation} m</span>
        </div>
        <div>
          <span className="text-text-tertiary text-[10px] uppercase font-medium block">Lowest</span>
          <span className="font-semibold text-text-primary">{data.lowestElevation} m</span>
        </div>
        <div>
          <span className="text-text-tertiary text-[10px] uppercase font-medium block">Gain / Loss</span>
          <span className="font-semibold text-text-primary">+{data.elevationGain}m / -{data.elevationLoss}m</span>
        </div>
      </div>
    </div>
  );
};
