import React from 'react';
import { Gauge, Clock, ArrowRight, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Journey } from '../../types';

interface TrainSummaryCardProps {
  journey: Journey;
}

export const TrainSummaryCard: React.FC<TrainSummaryCardProps> = ({ journey }) => {
  const isDelayed = journey.delayMinutes > 0;
  const clampedProgress = Math.min(100, Math.max(0, journey.progressPercentage));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-5 space-y-4">
      {/* Top Row: Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 lg:gap-3">
        
        {/* 1. Current / Last Station */}
        <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100/80 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>Current Station</span>
          </div>
          <div className="font-bold text-slate-900 text-sm md:text-base truncate">
            {journey.currentStation?.station.name || 'En Route'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {journey.currentStation?.station.code || 'NEAR'} · Plat {journey.currentStation?.platform || '1'}
          </div>
        </div>

        {/* 2. Next Station / ETA */}
        <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100/80 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>Next Stop</span>
          </div>
          <div className="font-bold text-slate-900 text-sm md:text-base truncate">
            {journey.nextStation?.station.name || journey.train.destination}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            ETA <span className="font-bold font-mono text-blue-600">{journey.nextStation?.actualArrival || journey.nextStation?.scheduledArrival || '--:--'}</span>
          </div>
        </div>

        {/* 3. Delay Status */}
        <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100/80 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Running Status
          </div>
          <div>
            {journey.delayMinutes === 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>On time</span>
              </span>
            ) : journey.delayMinutes > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>+{journey.delayMinutes} min Delay</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>{journey.delayMinutes} min (Early)</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            {isDelayed ? 'Recovering delay' : 'Running on schedule'}
          </div>
        </div>

        {/* 4. Current Speed */}
        <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100/80 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Gauge className="w-3 h-3 text-blue-600" />
            <span>Speed</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{Math.round(journey.position.speedKmh ?? 0)}</span>
            <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live telemetry</span>
          </div>
        </div>

        {/* 5. Distance Covered & Total */}
        <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100/80 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Distance
          </div>
          <div className="text-sm md:text-base font-bold font-mono text-slate-900">
            {journey.distanceCoveredKm.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">/ {journey.train.totalDistanceKm} km</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {journey.distanceRemainingKm} km remaining
          </div>
        </div>

        {/* 6. Progress Percentage */}
        <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100/80 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Completed
          </div>
          <div className="text-xl font-extrabold font-mono text-blue-600">
            {clampedProgress}%
          </div>
          <div className="text-[11px] text-slate-500">
            Journey progress
          </div>
        </div>

      </div>

      {/* Bottom Horizontal Progress Bar */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
          <span className="truncate max-w-[200px]">{journey.train.source}</span>
          <span className="text-blue-600 font-semibold">{clampedProgress}% Travelled</span>
          <span className="truncate max-w-[200px] text-right">{journey.train.destination}</span>
        </div>

        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${clampedProgress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
