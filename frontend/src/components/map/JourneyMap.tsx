import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreglWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Navigation2, Maximize, Minimize, Compass, RefreshCw } from 'lucide-react';
import { Journey, RouteGeometry } from '../../types';

// Explicitly register worker URL for MapLibre in Vite
maplibregl.setWorkerUrl(maplibreglWorkerUrl);

interface JourneyMapProps {
  journey: Journey;
  route?: RouteGeometry;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ journey, route }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [followMode, setFollowMode] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStyle, setActiveStyle] = useState<'streets' | 'outdoor' | 'dataviz'>('streets');
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const getStyleUrl = useCallback((style: 'streets' | 'outdoor' | 'dataviz') => {
    const key = import.meta.env.VITE_MAPTILER_API_KEY;
    if (!key) {
      return 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
    }
    const styleMap = {
      streets: 'streets-v4',
      outdoor: 'outdoor-v2',
      dataviz: 'dataviz-light'
    };
    return `https://api.maptiler.com/maps/${styleMap[style]}/style.json?key=${key}`;
  }, []);

  // Update Route Layers on the map
  const renderRouteLayers = useCallback((map: maplibregl.Map, routeData: RouteGeometry) => {
    if (!routeData || !routeData.geometry || !routeData.geometry.coordinates.length) return;

    // Remove existing station markers
    stationMarkersRef.current.forEach(m => m.remove());
    stationMarkersRef.current = [];

    // Add or update geojson source
    const source = map.getSource('route-source') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(routeData.geometry as any);
    } else {
      map.addSource('route-source', {
        type: 'geojson',
        data: routeData.geometry as any
      });

      // Route Outer Glow / Casing
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#0071E3',
          'line-width': 8,
          'line-opacity': 0.25
        }
      });

      // Route Main Track Line
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#0071E3',
          'line-width': 4
        }
      });

      // Railway Ties / Dashed Pattern Overlay
      map.addLayer({
        id: 'route-ties',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-cap': 'butt',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 2,
          'line-dasharray': [1, 2]
        }
      });
    }

    // Add Station markers along route
    routeData.stations.forEach((stop) => {
      const isCurrent = stop.station.code === journey.currentStation?.station.code;
      const isCompleted = stop.status === 'COMPLETED';

      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';
      el.innerHTML = `
        <div class="w-3.5 h-3.5 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 ${
          isCurrent
            ? 'bg-blue-600 border-white ring-4 ring-blue-500/30'
            : isCompleted
            ? 'bg-emerald-500 border-white shadow-sm'
            : 'bg-white border-slate-400 shadow-xs'
        }"></div>
      `;

      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
        <div class="px-2 py-1 font-sans">
          <div class="font-bold text-xs text-slate-900">${stop.station.name} (${stop.station.code})</div>
          <div class="text-[11px] text-slate-500 mt-0.5">
            Sched: <span class="font-medium text-slate-700">${stop.scheduledArrival}</span>
            ${stop.delayMinutes > 0 ? `<span class="text-amber-600 font-semibold ml-1">(+${stop.delayMinutes}m)</span>` : ''}
          </div>
          ${stop.platform ? `<div class="text-[10px] text-slate-400">Platform ${stop.platform}</div>` : ''}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([stop.station.longitude, stop.station.latitude])
        .setPopup(popup)
        .addTo(map);

      stationMarkersRef.current.push(marker);
    });
  }, [journey.currentStation?.station.code]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyle = getStyleUrl(activeStyle);

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: initialStyle,
        center: [journey.position.longitude, journey.position.latitude],
        zoom: 7.5,
        attributionControl: false
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      map.on('load', () => {
        setMapLoaded(true);
        map.resize();

        // Render route if already loaded
        if (route) {
          renderRouteLayers(map, route);
        }

        // Create Animated Train Marker with direction & radar pulse
        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center cursor-pointer';
        el.innerHTML = `
          <div class="absolute -inset-3 rounded-full bg-blue-500/25 animate-ping pointer-events-none"></div>
          <div class="absolute -inset-1.5 rounded-full bg-blue-500/30 animate-pulse pointer-events-none"></div>
          <div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform duration-300 transform" id="train-marker-body">
            <svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2c-4 0-8 1-8 5v10c0 1.5 1 2.5 2.5 2.5L5 21v1h2v-1h10v1h2v-1l-1.5-1.5c1.5 0 2.5-1 2.5-2.5V7c0-4-4-5-8-5zm0 2c3.5 0 6 .8 6 3H6c0-2.2 2.5-3 6-3zm-6 7h12v5H6v-5zm2.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
            </svg>
          </div>
        `;

        const trainMarker = new maplibregl.Marker({ element: el })
          .setLngLat([journey.position.longitude, journey.position.latitude])
          .addTo(map);

        trainMarkerRef.current = trainMarker;
      });

      map.on('style.load', () => {
        if (route) {
          renderRouteLayers(map, route);
        }
      });

      map.on('error', (e) => {
        console.error('MapLibre error:', e);
      });

      mapRef.current = map;

      // Resize observer to ensure zero blank-canvas collapses
      const resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        stationMarkersRef.current.forEach(m => m.remove());
        map.remove();
      };
    } catch (err) {
      console.error('Failed to initialize MapLibre GL:', err);
    }
  }, [getStyleUrl]);

  // When route data updates asynchronously, render layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !route) return;
    renderRouteLayers(map, route);
  }, [route, mapLoaded, renderRouteLayers]);

  // Update Train Position & Bearing
  useEffect(() => {
    if (!mapRef.current || !trainMarkerRef.current) return;

    trainMarkerRef.current.setLngLat([journey.position.longitude, journey.position.latitude]);

    // Rotate marker body according to train heading
    const markerBody = document.getElementById('train-marker-body');
    if (markerBody && journey.position.bearing !== undefined) {
      markerBody.style.transform = `rotate(${journey.position.bearing}deg)`;
    }

    if (followMode) {
      mapRef.current.easeTo({
        center: [journey.position.longitude, journey.position.latitude],
        duration: 1200
      });
    }
  }, [journey.position.latitude, journey.position.longitude, journey.position.bearing, followMode]);

  // Switch Map Style
  const handleSwitchStyle = (style: 'streets' | 'outdoor' | 'dataviz') => {
    setActiveStyle(style);
    setShowStyleMenu(false);
    if (mapRef.current) {
      mapRef.current.setStyle(getStyleUrl(style));
    }
  };

  const handleLocateTrain = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [journey.position.longitude, journey.position.latitude],
        zoom: 9.5,
        duration: 1500
      });
      setFollowMode(true);
    }
  };

  const handleFitRoute = () => {
    if (mapRef.current && route && route.geometry.coordinates.length) {
      const bounds = new maplibregl.LngLatBounds();
      route.geometry.coordinates.forEach(coord => bounds.extend(coord as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: 48, duration: 1200 });
      setFollowMode(false);
    }
  };

  const handleToggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-50 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[460px] md:h-[540px] lg:h-[600px]'
      }`}
    >
      {/* MapLibre WebGL Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%', minHeight: '460px' }}
      />

      {/* Floating Apple-Style Control Panel (Top Right) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
        {/* Recenter on Train */}
        <button
          onClick={handleLocateTrain}
          className={`p-2.5 rounded-xl shadow-md backdrop-blur-md border transition-all ${
            followMode
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
              : 'bg-white/95 text-slate-700 hover:text-blue-600 border-slate-200/80 hover:bg-white'
          }`}
          title="Center on train"
        >
          <Navigation2 className="w-4 h-4" />
        </button>

        {/* View Full Route */}
        <button
          onClick={handleFitRoute}
          className="p-2.5 rounded-xl shadow-md backdrop-blur-md bg-white/95 text-slate-700 hover:text-blue-600 border border-slate-200/80 hover:bg-white transition-all"
          title="View entire railway route"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-xl overflow-hidden shadow-md bg-white/95 backdrop-blur-md border border-slate-200/80">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2.5 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors font-bold text-sm"
            title="Zoom in"
          >
            +
          </button>
          <div className="h-[1px] bg-slate-200/60" />
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2.5 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors font-bold text-sm"
            title="Zoom out"
          >
            −
          </button>
        </div>

        {/* Layer Selector */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className={`p-2.5 rounded-xl shadow-md backdrop-blur-md border transition-all ${
              showStyleMenu
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/95 text-slate-700 hover:text-blue-600 border-slate-200/80 hover:bg-white'
            }`}
            title="Switch map basemap style"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 top-11 bg-white rounded-xl shadow-xl border border-slate-200 py-1 w-32 z-30 animate-fade-in text-xs font-medium">
              <button
                onClick={() => handleSwitchStyle('streets')}
                className={`w-full px-3 py-1.5 text-left transition-colors flex items-center justify-between ${
                  activeStyle === 'streets' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Streets</span>
                {activeStyle === 'streets' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
              <button
                onClick={() => handleSwitchStyle('outdoor')}
                className={`w-full px-3 py-1.5 text-left transition-colors flex items-center justify-between ${
                  activeStyle === 'outdoor' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Outdoor/Topo</span>
                {activeStyle === 'outdoor' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
              <button
                onClick={() => handleSwitchStyle('dataviz')}
                className={`w-full px-3 py-1.5 text-left transition-colors flex items-center justify-between ${
                  activeStyle === 'dataviz' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Minimal</span>
                {activeStyle === 'dataviz' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2.5 rounded-xl shadow-md backdrop-blur-md bg-white/95 text-slate-700 hover:text-blue-600 border border-slate-200/80 hover:bg-white transition-all hidden sm:block"
          title="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Status Badges (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{journey.position.speedKmh || 110} km/h</span>
        </div>

        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 text-xs text-slate-600">
          <span className="text-[10px] uppercase font-bold text-slate-400">Heading</span>
          <span className="font-semibold text-slate-800">{journey.position.bearing || 270}°</span>
        </div>
      </div>
    </div>
  );
};
