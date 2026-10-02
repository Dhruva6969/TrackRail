import React, { useState } from 'react';
import { Search, Train as TrainIcon, Heart, History, ChevronRight, Map, Zap, BarChart3, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrainSearch } from '../hooks/useTrainSearch';
import { usePreferencesStore } from '../stores/preferencesStore';
import { Train } from '../types';

// Popular trains as quick-access chips (fixed well-known trains, UI-only constant)
const POPULAR_TRAINS = [
  { id: '12301', number: '12301', name: 'Howrah Rajdhani', source: 'Howrah Jn (HWH)', destination: 'New Delhi (NDLS)', totalDistanceKm: 1451, type: 'Rajdhani' },
  { id: '12951', number: '12951', name: 'Mumbai Rajdhani', source: 'Mumbai Central (MMCT)', destination: 'New Delhi (NDLS)', totalDistanceKm: 1386, type: 'Rajdhani' },
  { id: '12002', number: '12002', name: 'Bhopal Shatabdi', source: 'New Delhi (NDLS)', destination: 'Rani Kamlapati (RKMP)', totalDistanceKm: 708, type: 'Shatabdi' },
  { id: '22436', number: '22436', name: 'Vande Bharat', source: 'New Delhi (NDLS)', destination: 'Varanasi Jn (BSB)', totalDistanceKm: 759, type: 'Vande Bharat' }
] satisfies import('../types').Train[];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  
  const { data: results = [], isLoading } = useTrainSearch(query);
  const { recentSearches, favouriteTrains, addRecentSearch, toggleFavourite, isFavourite } = usePreferencesStore();

  const handleSelectTrain = (train: Train) => {
    addRecentSearch(train);
    navigate(`/journey/${train.id}`);
  };

  /** Handle Track button: if numeric, navigate directly; otherwise trigger search. */
  const handleTrack = () => {
    const q = query.trim();
    if (!q) return;
    if (/^\d{3,5}$/.test(q)) {
      navigate(`/journey/${q}`);
    }
    // For non-numeric, the search dropdown will already show results; do nothing extra
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between p-4 md:p-8 selection:bg-blue-100 selection:text-blue-700">
      
      {/* 1. Compact Navbar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(37,99,235,0.35)] font-bold text-sm tracking-wider">
              <TrainIcon className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">TrackRail</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/journey/${recentSearches[0]?.id ?? POPULAR_TRAINS[0].id}`)} 
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>Live Tracking</span>
          </button>

          {favouriteTrains.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{favouriteTrains.length} Saved</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full space-y-10 my-auto py-2">
        
        {/* 2. Large Rounded Hero Container */}
        <div className="relative rounded-[32px] bg-gradient-to-b from-blue-50/90 via-blue-50/30 to-white border border-blue-100/80 ring-1 ring-white/80 shadow-[0_20px_50px_-15px_rgba(0,113,227,0.08)] p-6 md:p-12 text-center space-y-6 overflow-hidden">
          
          {/* Decorative background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200/25 blur-3xl rounded-full pointer-events-none" />

          {/* 4. Small pill/badge above heading */}
          <div className="relative inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-semibold border border-blue-500/20 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Next-Gen Railway Intelligence</span>
          </div>

          {/* 3. Hero Heading */}
          <div className="relative space-y-3">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Train Tracking, <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">Redefined.</span>
            </h1>
            {/* 5. Description below heading */}
            <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Real-time train positioning, station timelines, delay analytics, terrain elevation profiles, weather, and nearby geographic landmarks in one visual view.
            </p>
          </div>

          {/* 6. Search Bar INSIDE the Hero Container */}
          <div className="relative max-w-xl mx-auto space-y-3 pt-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Search className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                placeholder="Enter 5-digit train number (e.g. 12301, 22436)..."
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <button
                onClick={handleTrack}
                className="absolute right-2 top-2 bottom-2 px-4.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-xs transition-all shadow-[0_2px_8px_rgba(37,99,235,0.25)] flex items-center gap-1 active:scale-95"
              >
                <span>Track</span>
              </button>
            </div>

            {/* Instant Search Results Dropdown inside Hero */}
            {query.trim().length >= 2 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 text-left animate-fade-in z-20 relative">
                {isLoading ? (
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                  </div>
                ) : results.length > 0 ? (
                  results.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTrain(t)}
                      className="p-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <TrainIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{t.number}</span>
                            <span className="font-semibold text-xs text-slate-800">{t.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {t.source} → {t.destination} · {t.totalDistanceKm} km
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs space-y-1.5">
                    <div>No results for "<span className="font-medium text-slate-900">{query}</span>"</div>
                    {/^\d{3,5}$/.test(query.trim()) ? (
                      <button
                        onClick={handleTrack}
                        className="text-blue-600 font-semibold hover:underline text-xs"
                      >
                        Track train #{query.trim()} directly →
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        Try a 5-digit train number (e.g. 12301, 22436, 12951)
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 7. Quick-search Chips INSIDE Hero */}
            <div className="flex items-center justify-center flex-wrap gap-2 text-xs pt-1.5">
              <span className="text-slate-400 text-[11px] font-semibold tracking-wide mr-1 uppercase">Popular:</span>
              {POPULAR_TRAINS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTrain(t)}
                  className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-sm text-slate-700 hover:text-blue-600 transition-all font-medium text-[11px] flex items-center gap-1.5 active:scale-95"
                >
                  <span className="font-mono font-bold text-slate-900">{t.number}</span>
                  <span className="text-slate-600">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Recent Searches BELOW the Hero */}
        {recentSearches.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Recent Searches</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium font-mono">{recentSearches.length} trains</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {recentSearches.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTrain(t)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-[0_8px_25px_-6px_rgba(0,0,0,0.06)] hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-slate-100/80 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors flex items-center justify-center shrink-0">
                      <TrainIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                        <span className="font-mono">{t.number}</span>
                        <span className="font-medium text-slate-600 truncate">{t.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {t.source} → {t.destination}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(t);
                      }}
                      className="p-1 rounded-full text-slate-300 hover:text-rose-500 transition-colors"
                      title="Save train"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavourite(t.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. Three Feature Cards BELOW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-2">
          
          <div className="p-5.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300 transition-all space-y-2.5">
            <div className="w-9.5 h-9.5 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/15">
              <Map className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm tracking-tight">Interactive Map Tracking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Live GPS train positioning, complete route line geometry, station stops, and follow-camera navigation.
            </p>
          </div>

          <div className="p-5.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300 transition-all space-y-2.5">
            <div className="w-9.5 h-9.5 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/15">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm tracking-tight">30s Auto Refresh</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Telemetry updates automatically every 30 seconds with data freshness indicators and manual refresh controls.
            </p>
          </div>

          <div className="p-5.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300 transition-all space-y-2.5">
            <div className="w-9.5 h-9.5 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/15">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm tracking-tight">Delay & ETA Intelligence</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Station delay analytics, travel timelines, terrain elevation profiles, and contextual destination weather.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-6 text-xs text-slate-400 border-t border-slate-200/60 mt-8">
        TrackRail © 2026 · Real-Time Indian Railway Journey Tracking SaaS
      </footer>
    </div>
  );
};
