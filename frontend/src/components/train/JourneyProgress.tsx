import React from 'react';
import { Navigation, Compass, MapPin } from 'lucide-react';

interface JourneyProgressProps {
  progressPercentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  sourceName?: string;
  destinationName?: string;
}

export const JourneyProgress: React.FC<JourneyProgressProps> = ({
  progressPercentage,
  distanceCoveredKm,
  distanceRemainingKm,
  sourceName = 'Source',
  destinationName = 'Destination'
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  return (
    <div className="bg-surface rounded-card p-5 border border-surface-tertiary shadow-apple space-y-4">
      <div className="flex justify-between items-center text-xs text-text-secondary font-medium">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-accent" />
          <span className="truncate max-w-[140px]">{sourceName}</span>
        </span>
        <span className="text-accent font-semibold">{clampedProgress}% Complete</span>
        <span className="flex items-center gap-1">
          <span className="truncate max-w-[140px] text-right">{destinationName}</span>
          <Compass className="w-3.5 h-3.5 text-text-tertiary" />
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-3 bg-surface-secondary rounded-full overflow-hidden p-0.5 border border-black/5">
        <div
          className="h-full bg-gradient-to-r from-accent to-blue-500 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${clampedProgress}%` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Distance Stats */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-surface-secondary/70 p-3 rounded-xl border border-surface-tertiary/50">
          <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Distance Covered</div>
          <div className="text-lg font-bold text-text-primary mt-0.5 flex items-baseline gap-1">
            <span>{distanceCoveredKm.toLocaleString()}</span>
            <span className="text-xs font-normal text-text-secondary">km</span>
          </div>
        </div>

        <div className="bg-surface-secondary/70 p-3 rounded-xl border border-surface-tertiary/50">
          <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Remaining</div>
          <div className="text-lg font-bold text-text-primary mt-0.5 flex items-baseline gap-1">
            <span>{distanceRemainingKm.toLocaleString()}</span>
            <span className="text-xs font-normal text-text-secondary">km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
