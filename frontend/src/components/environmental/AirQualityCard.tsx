import React from 'react';
import { Wind, Activity, RefreshCw, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface AirQualityData {
  T: number;
  RH: number;
  AH: number;
  NOx_GT: number;
  NO2_GT: number;
}

export interface AirPredictionResult {
  prediction_CO_GT: number;
  status: 'Good' | 'Moderate' | 'Hazardous';
  engine?: string;
}

interface AirQualityCardProps {
  data: AirQualityData;
  prediction: AirPredictionResult | null;
  loading: boolean;
  mode: 'live' | 'manual';
  onModeChange: (mode: 'live' | 'manual') => void;
  onDataChange: (data: AirQualityData) => void;
  onPredict: () => void;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({
  data,
  prediction,
  loading,
  mode,
  onModeChange,
  onDataChange,
  onPredict,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Good':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300',
          bar: 'bg-emerald-500',
          shadow: 'shadow-emerald-950/50',
        };
      case 'Moderate':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
          bar: 'bg-amber-500',
          shadow: 'shadow-amber-950/50',
        };
      case 'Hazardous':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-950/80 border-rose-800/80 text-rose-300',
          bar: 'bg-rose-500',
          shadow: 'shadow-rose-950/50',
        };
      default:
        return {
          text: 'text-charcoal-400',
          bg: 'bg-charcoal-800 border-charcoal-700 text-charcoal-300',
          bar: 'bg-charcoal-600',
          shadow: 'shadow-none',
        };
    }
  };

  const statusStyle = getStatusColor(prediction?.status);
  const coValue = prediction?.prediction_CO_GT ?? 0;
  // Progress bar percentage (0 to 10 mg/m³)
  const progressPercent = Math.min(100, Math.max(5, (coValue / 8.0) * 100));

  return (
    <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-forest-950/70 border border-forest-800/60 rounded-lg">
              <Wind className="w-5 h-5 text-forest-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Air Quality AI Predictor</h3>
              <p className="text-xs text-charcoal-450 font-mono">Random Forest Regressor • CO (mg/m³)</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-charcoal-950 p-1 rounded-lg border border-charcoal-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => onModeChange('live')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'live' ? 'bg-forest-600 text-white font-bold' : 'text-charcoal-400 hover:text-white'
              }`}
            >
              Live Telemetry
            </button>
            <button
              type="button"
              onClick={() => onModeChange('manual')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'manual' ? 'bg-forest-600 text-white font-bold' : 'text-charcoal-400 hover:text-white'
              }`}
            >
              Simulation Mode
            </button>
          </div>
        </div>

        {/* Input Controls */}
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-mono text-charcoal-400 mb-1">
                <span>Temp (T)</span>
                <span className="text-white">{data.T.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="50"
                step="0.5"
                disabled={mode === 'live'}
                value={data.T}
                onChange={(e) => onDataChange({ ...data, T: parseFloat(e.target.value) })}
                className="w-full accent-forest-500 disabled:opacity-50 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-charcoal-400 mb-1">
                <span>Rel Humidity (RH)</span>
                <span className="text-white">{data.RH.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                disabled={mode === 'live'}
                value={data.RH}
                onChange={(e) => onDataChange({ ...data, RH: parseFloat(e.target.value) })}
                className="w-full accent-forest-500 disabled:opacity-50 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-charcoal-400 mb-1">
                <span>Abs Humidity</span>
                <span className="text-white">{data.AH.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                disabled={mode === 'live'}
                value={data.AH}
                onChange={(e) => onDataChange({ ...data, AH: parseFloat(e.target.value) })}
                className="w-full accent-forest-500 disabled:opacity-50 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-charcoal-400 mb-1">
                <span>NOx (ppb)</span>
                <span className="text-white">{data.NOx_GT.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="5"
                disabled={mode === 'live'}
                value={data.NOx_GT}
                onChange={(e) => onDataChange({ ...data, NOx_GT: parseFloat(e.target.value) })}
                className="w-full accent-forest-500 disabled:opacity-50 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-charcoal-400 mb-1">
                <span>NO2 (µg/m³)</span>
                <span className="text-white">{data.NO2_GT.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="2"
                disabled={mode === 'live'}
                value={data.NO2_GT}
                onChange={(e) => onDataChange({ ...data, NO2_GT: parseFloat(e.target.value) })}
                className="w-full accent-forest-500 disabled:opacity-50 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Prediction Trigger (Manual Mode) */}
        {mode === 'manual' && (
          <button
            type="button"
            onClick={onPredict}
            disabled={loading}
            className="mt-4 w-full py-2 bg-charcoal-800 hover:bg-charcoal-750 text-forest-300 border border-forest-500/40 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            <span>Calculate Air Quality Prediction</span>
          </button>
        )}
      </div>

      {/* Prediction Result Display */}
      <div className="mt-5 pt-4 border-t border-charcoal-800/80 bg-charcoal-950/60 rounded-xl p-4 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-charcoal-400 font-mono">Predicted Carbon Monoxide:</span>
          {prediction && (
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${statusStyle.bg}`}>
              {prediction.status}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black font-mono tracking-tight text-white">
            {prediction ? prediction.prediction_CO_GT.toFixed(2) : '--'}
          </span>
          <span className="text-xs font-mono text-charcoal-450">mg/m³ CO(GT)</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-500 rounded-full ${statusStyle.bar}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-charcoal-500">
          <span>0.0 (Clean)</span>
          <span>2.0 (Moderate)</span>
          <span>5.0+ (Hazardous)</span>
        </div>
      </div>
    </div>
  );
};
