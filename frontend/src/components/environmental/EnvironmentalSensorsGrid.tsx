import React from 'react';
import { 
  Thermometer, Droplets, Droplet, Wind, CloudRain, 
  Mountain, AlertTriangle, Activity, Gauge
} from 'lucide-react';

export interface EnvironmentalSensors {
  temperature: number;
  humidity: number;
  absHumidity: number;
  no2: number;
  nox: number;
  pm25: number;
  precipitation: number;
  soilMoisture: number;
  windSpeed: number;
}

interface EnvironmentalSensorsGridProps {
  sensors: EnvironmentalSensors;
}

export const EnvironmentalSensorsGrid: React.FC<EnvironmentalSensorsGridProps> = ({ sensors }) => {
  const cards = [
    {
      label: 'Ambient Temperature',
      value: `${sensors.temperature.toFixed(1)}°C`,
      sub: sensors.temperature > 35 ? 'Elevated Heat' : 'Normal',
      icon: <Thermometer className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-500/5',
      badge: sensors.temperature > 30 ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300',
    },
    {
      label: 'Relative Humidity',
      value: `${sensors.humidity.toFixed(0)}%`,
      sub: sensors.humidity > 70 ? 'High Moisture' : 'Moderate',
      icon: <Droplets className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/30 bg-sky-500/5',
      badge: 'bg-sky-950 text-sky-300',
    },
    {
      label: 'Absolute Humidity',
      value: `${sensors.absHumidity.toFixed(2)} g/m³`,
      sub: 'Magnus-Tetens Formula',
      icon: <Droplet className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/30 bg-indigo-500/5',
      badge: 'bg-indigo-950 text-indigo-300',
    },
    {
      label: 'Nitrogen Dioxide (NO₂)',
      value: `${sensors.no2.toFixed(1)} µg/m³`,
      sub: sensors.no2 > 40 ? 'Above WHO Guideline' : 'Acceptable',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/5',
      badge: sensors.no2 > 40 ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300',
    },
    {
      label: 'Nitrogen Oxides (NOₓ)',
      value: `${sensors.nox.toFixed(1)} ppb`,
      sub: 'Traffic & Combustion',
      icon: <Gauge className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-500/5',
      badge: 'bg-purple-950 text-purple-300',
    },
    {
      label: 'Fine Particulate (PM2.5)',
      value: `${sensors.pm25.toFixed(1)} µg/m³`,
      sub: sensors.pm25 > 35 ? 'Unhealthy for Sensitive' : 'Good',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/30 bg-rose-500/5',
      badge: sensors.pm25 > 35 ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300',
    },
    {
      label: 'Precipitation',
      value: `${sensors.precipitation.toFixed(1)} mm`,
      sub: sensors.precipitation > 5 ? 'Active Rainfall' : 'Dry / Clear',
      icon: <CloudRain className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30 bg-cyan-500/5',
      badge: 'bg-cyan-950 text-cyan-300',
    },
    {
      label: 'Soil Moisture',
      value: `${(sensors.soilMoisture * 100).toFixed(0)}%`,
      sub: `${sensors.soilMoisture.toFixed(2)} m³/m³`,
      icon: <Mountain className="w-5 h-5 text-yellow-500" />,
      color: 'border-yellow-500/30 bg-yellow-500/5',
      badge: 'bg-yellow-950 text-yellow-300',
    },
    {
      label: 'Surface Wind Speed',
      value: `${sensors.windSpeed.toFixed(1)} km/h`,
      sub: sensors.windSpeed > 20 ? 'Breezy / Dispersive' : 'Light Air',
      icon: <Wind className="w-5 h-5 text-teal-400" />,
      color: 'border-teal-500/30 bg-teal-500/5',
      badge: 'bg-teal-950 text-teal-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`border rounded-xl p-4 backdrop-blur-md transition-all hover:border-charcoal-600 ${card.color}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-charcoal-400 font-medium">{card.label}</span>
            <div className="p-2 bg-charcoal-900/80 rounded-lg border border-charcoal-800">
              {card.icon}
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
            {card.value}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-charcoal-450">{card.sub}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${card.badge}`}>
              Telemetry
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
