import React, { useEffect, useRef } from 'react';
import { Check, MapPin, Clock, ArrowRight } from 'lucide-react';
import { StationStop } from '../../types';

interface StationTimelineProps {
  stations: StationStop[];
  currentStationCode?: string;
}

export const StationTimeline: React.FC<StationTimelineProps> = ({ stations, currentStationCode }) => {
  const currentStationRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current station on mount or update
  useEffect(() => {
    if (currentStationRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = currentStationRef.current;
      const topOffset = element.offsetTop - container.offsetTop - 60;
      container.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
  }, [currentStationCode]);

  const currentIndex = currentStationCode
    ? stations.findIndex(s => s.station.code.toUpperCase() === currentStationCode.toUpperCase())
    : stations.findIndex(s => s.status === 'CURRENT');

  const completedCount = currentIndex >= 0
    ? currentIndex
    : stations.filter(s => s.status === 'COMPLETED').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">Station Route Timeline</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {completedCount} of {stations.length} completed
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 font-mono">
            Total: {stations.length} Stops
          </span>
        </div>
      </div>

      {/* Scrollable Timeline Stops */}
      <div
        ref={containerRef}
        className="p-4 overflow-y-auto space-y-4 relative flex-1 max-h-[460px] md:max-h-[540px] lg:max-h-[560px] scrollbar-thin"
      >
        <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200/80">
          {stations.map((stop, idx) => {
            const isCurrent = currentIndex >= 0 ? idx === currentIndex : stop.status === 'CURRENT';
            const isCompleted = currentIndex >= 0 ? idx < currentIndex : stop.status === 'COMPLETED';
            const isUpcoming = currentIndex >= 0 ? idx > currentIndex : stop.status === 'UPCOMING';

            return (
              <div
                key={stop.station.id || idx}
                ref={isCurrent ? currentStationRef : null}
                className="relative group"
              >
                {/* Timeline Marker Dot */}
                <div
                  className={`absolute -left-[23px] top-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-transform duration-200 group-hover:scale-110 ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/25 z-10 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <MapPin className="w-3.5 h-3.5 animate-bounce" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </div>

                {/* Station Row Content Card */}
                <div
                  className={`p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-blue-50/70 border border-blue-200/90 shadow-xs'
                      : isCompleted
                      ? 'bg-slate-50/40 hover:bg-slate-50 border border-transparent'
                      : 'bg-white hover:bg-slate-50/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-bold text-xs md:text-sm truncate ${
                            isCurrent
                              ? 'text-blue-700'
                              : isCompleted
                              ? 'text-slate-800'
                              : 'text-slate-600'
                          }`}
                        >
                          {stop.station.name}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                          {stop.station.code}
                        </span>

                        {isCurrent && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-600 text-white animate-pulse">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{stop.distanceFromSourceKm} km</span>
                        {stop.platform && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">Plat {stop.platform}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Timings & Delay */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {stop.actualArrival && stop.actualArrival !== '--:--'
                            ? stop.actualArrival
                            : stop.scheduledArrival && stop.scheduledArrival !== '--:--'
                            ? stop.scheduledArrival
                            : stop.actualDeparture || stop.scheduledDeparture || '--:--'}
                        </span>
                      </div>

                      {stop.delayMinutes === 0 ? (
                        <div className="text-[10px] font-medium text-emerald-600 mt-0.5">
                          On time
                        </div>
                      ) : stop.delayMinutes > 0 ? (
                        <div className="text-[10px] font-semibold text-amber-600 mt-0.5">
                          +{stop.delayMinutes} min
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-blue-600 mt-0.5">
                          {stop.delayMinutes} min
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Click any station on map for details</span>
        <span className="font-semibold text-slate-700">Total: {stations.length} Stops</span>
      </div>
    </div>
  );
};
