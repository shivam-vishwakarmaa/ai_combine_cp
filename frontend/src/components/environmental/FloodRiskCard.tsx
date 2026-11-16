import React from 'react';
import { CloudRain, ShieldAlert, Cpu, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface FloodData {
  MonsoonIntensity: number;
  RiverManagement: number;
  Deforestation: number;
  Urbanization: number;
  ClimateChange: number;
  DamsQuality: number;
  DrainageSystems: number;
}

export interface FloodPredictionResult {
  flood_risk_prediction: number;
  risk_label: 'High Risk' | 'Low Risk';
  probability_high_risk: number;
  engine?: string;
}

interface FloodRiskCardProps {
  data: FloodData;
  prediction: FloodPredictionResult | null;
  loading: boolean;
  mode: 'live' | 'manual';
  onModeChange: (mode: 'live' | 'manual') => void;
  onDataChange: (data: FloodData) => void;
  onPredict: () => void;
}

export const FloodRiskCard: React.FC<FloodRiskCardProps> = ({
  data,
  prediction,
  loading,
  mode,
  onModeChange,
  onDataChange,
  onPredict,
}) => {
  const isHighRisk = prediction?.risk_label === 'High Risk';
  const probPercent = prediction ? Math.round(prediction.probability_high_risk * 100) : 0;

  return (
    <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/70 border border-sky-800/60 rounded-lg">
              <CloudRain className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Flood Risk AI Predictor</h3>
              <p className="text-xs text-charcoal-450 font-mono">Random Forest Classifier • Multi-Factor</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-charcoal-950 p-1 rounded-lg border border-charcoal-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => onModeChange('live')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'live' ? 'bg-sky-600 text-white font-bold' : 'text-charcoal-400 hover:text-white'
              }`}
            >
              Live Weather
            </button>
            <button
              type="button"
              onClick={() => onModeChange('manual')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'manual' ? 'bg-sky-600 text-white font-bold' : 'text-charcoal-400 hover:text-white'
              }`}
            >
              Simulation Mode
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="mt-4 space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-mono text-charcoal-400 mb-1">
                <span>Monsoon Intensity</span>
                <span className="text-white">{data.MonsoonIntensity}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={mode === 'live'}
                value={data.MonsoonIntensity}
                onChange={(e) => onDataChange({ ...data, MonsoonIntensity: parseInt(e.target.value) })}
                className="w-full accent-sky-500 disabled:opacity-50 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-charcoal-400 mb-1">
                <span>Drainage Efficiency</span>
                <span className="text-white">{data.DrainageSystems}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={mode === 'live'}
                value={data.DrainageSystems}
                onChange={(e) => onDataChange({ ...data, DrainageSystems: parseInt(e.target.value) })}
                className="w-full accent-sky-500 disabled:opacity-50 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-mono text-charcoal-400 mb-1">
                <span>Deforestation Impact</span>
                <span className="text-white">{data.Deforestation}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={mode === 'live'}
                value={data.Deforestation}
                onChange={(e) => onDataChange({ ...data, Deforestation: parseInt(e.target.value) })}
                className="w-full accent-sky-500 disabled:opacity-50 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-charcoal-400 mb-1">
                <span>Urbanization Level</span>
                <span className="text-white">{data.Urbanization}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={mode === 'live'}
                value={data.Urbanization}
                onChange={(e) => onDataChange({ ...data, Urbanization: parseInt(e.target.value) })}
                className="w-full accent-sky-500 disabled:opacity-50 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-charcoal-400 mb-1">
                <span>River Mgmt</span>
                <span className="text-white">{data.RiverManagement}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={mode === 'live'}
                value={data.RiverManagement}
                onChange={(e) => onDataChange({ ...data, RiverManagement: parseInt(e.target.value) })}
                className="w-full accent-sky-500 disabled:opacity-50 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-charcoal-400 mb-1">
                <span>Climate Factor</span>
                <span className="text-white">{data.ClimateChange}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={mode === 'live'}
                value={data.ClimateChange}
                onChange={(e) => onDataChange({ ...data, ClimateChange: parseInt(e.target.value) })}
                className="w-full accent-sky-500 disabled:opacity-50 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono text-charcoal-400 mb-1">
                <span>Dams Quality</span>
                <span className="text-white">{data.DamsQuality}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={mode === 'live'}
                value={data.DamsQuality}
                onChange={(e) => onDataChange({ ...data, DamsQuality: parseInt(e.target.value) })}
                className="w-full accent-sky-500 disabled:opacity-50 cursor-pointer"
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
            className="mt-4 w-full py-2 bg-charcoal-800 hover:bg-charcoal-750 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            <span>Calculate Flood Risk Prediction</span>
          </button>
        )}
      </div>

      {/* Prediction Result Display */}
      <div className="mt-5 pt-4 border-t border-charcoal-800/80 bg-charcoal-950/60 rounded-xl p-4 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-charcoal-400 font-mono">Flood Risk Assessment:</span>
          {prediction && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold border flex items-center gap-1 ${
                isHighRisk
                  ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                  : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              }`}
            >
              {isHighRisk ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              {prediction.risk_label}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black font-mono tracking-tight text-white">
            {prediction ? `${probPercent}%` : '--%'}
          </span>
          <span className="text-xs font-mono text-charcoal-450">High Risk Probability</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              probPercent >= 50 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(5, probPercent)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-charcoal-500">
          <span>0% (Safe)</span>
          <span>50% (Threshold)</span>
          <span>100% (Critical)</span>
        </div>
      </div>
    </div>
  );
};
