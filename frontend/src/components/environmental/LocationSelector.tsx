import React, { useState } from 'react';
import { Search, Navigation, MapPin, RefreshCw } from 'lucide-react';

export interface LocationInfo {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const POPULAR_CITIES: LocationInfo[] = [
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090, country: 'India' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'India' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' }
];

interface LocationSelectorProps {
  currentLocation: LocationInfo;
  lastUpdated: string;
  isFetching: boolean;
  onSelectCity: (lat: number, lon: number, name: string, country: string) => void;
  onSearchCity: (query: string) => void;
  onUseGps: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  lastUpdated,
  isFetching,
  onSelectCity,
  onSearchCity,
  onUseGps,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSearchCity(inputVal.trim());
    setInputVal('');
  };

  return (
    <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & GPS Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-450" />
            <input
              type="text"
              placeholder="Search any global city or region (e.g. Paris, Sydney, Cairo)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-charcoal-950 border border-charcoal-750 rounded-lg text-sm text-white placeholder-charcoal-500 focus:outline-none focus:border-forest-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching}
            className="px-4 py-2 bg-forest-600 hover:bg-forest-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={onUseGps}
            disabled={isFetching}
            title="Use device GPS location"
            className="px-3 py-2 bg-charcoal-800 hover:bg-charcoal-700 disabled:opacity-50 text-emerald-400 border border-charcoal-700 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Navigation className="w-4 h-4" />
            <span className="hidden sm:inline">My GPS</span>
          </button>
        </form>

        {/* Current Location Badge & Telemetry Status */}
        <div className="flex items-center gap-3 bg-charcoal-950/70 border border-charcoal-800 px-3.5 py-1.5 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-forest-400 animate-pulse" />
            <span>{currentLocation.name}</span>
            {currentLocation.country && <span className="text-charcoal-400">({currentLocation.country})</span>}
          </div>
          <span className="text-charcoal-600">|</span>
          <span className="text-charcoal-400">{currentLocation.lat.toFixed(2)}°, {currentLocation.lon.toFixed(2)}°</span>
          {lastUpdated && (
            <>
              <span className="text-charcoal-600">|</span>
              <span className="text-charcoal-450 text-[11px]">{lastUpdated}</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Select Popular Cities */}
      <div className="mt-3 pt-3 border-t border-charcoal-800/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-charcoal-400 font-mono text-[11px] whitespace-nowrap">Quick Select:</span>
        <div className="flex items-center gap-1.5">
          {POPULAR_CITIES.map((c) => {
            const isSelected = currentLocation.name === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onSelectCity(c.lat, c.lon, c.name, c.country)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-forest-500/20 text-forest-300 border border-forest-500/40'
                    : 'bg-charcoal-800/80 hover:bg-charcoal-750 text-charcoal-300 border border-charcoal-700/60'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
