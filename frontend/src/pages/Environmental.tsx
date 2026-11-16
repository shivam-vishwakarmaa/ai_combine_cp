import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, CloudRain, Wind, BarChart3, RefreshCw, 
  MapPin, ShieldAlert, Sparkles, Database, Globe
} from 'lucide-react';
import { LocationSelector, LocationInfo, POPULAR_CITIES } from '../components/environmental/LocationSelector';
import { EnvironmentalSensorsGrid, EnvironmentalSensors } from '../components/environmental/EnvironmentalSensorsGrid';
import { AirQualityCard, AirQualityData, AirPredictionResult } from '../components/environmental/AirQualityCard';
import { FloodRiskCard, FloodData, FloodPredictionResult } from '../components/environmental/FloodRiskCard';
import { TrainingMetricsModal } from '../components/environmental/TrainingMetricsModal';

export const Environmental: React.FC = () => {
  // --- Location State ---
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({
    name: 'New Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState<boolean>(false);

  // --- Real-time Sensor / Atmosphere State ---
  const [liveSensors, setLiveSensors] = useState<EnvironmentalSensors>({
    temperature: 25.0,
    humidity: 50.0,
    absHumidity: 11.5,
    no2: 45.0,
    nox: 95.0,
    pm25: 35.0,
    precipitation: 0.0,
    soilMoisture: 0.35,
    windSpeed: 8.5
  });

  // --- Air Quality Model Inputs & State ---
  const [airData, setAirData] = useState<AirQualityData>({
    T: 25.0,
    RH: 50.0,
    AH: 11.5,
    NOx_GT: 95.0,
    NO2_GT: 45.0
  });
  const [airPrediction, setAirPrediction] = useState<AirPredictionResult | null>(null);
  const [airLoading, setAirLoading] = useState<boolean>(false);
  const [airMode, setAirMode] = useState<'live' | 'manual'>('live');

  // --- Flood Detection Model Inputs & State ---
  const [floodData, setFloodData] = useState<FloodData>({
    MonsoonIntensity: 4,
    RiverManagement: 5,
    Deforestation: 6,
    Urbanization: 7,
    ClimateChange: 5,
    DamsQuality: 5,
    DrainageSystems: 4
  });
  const [floodPrediction, setFloodPrediction] = useState<FloodPredictionResult | null>(null);
  const [floodLoading, setFloodLoading] = useState<boolean>(false);
  const [floodMode, setFloodMode] = useState<'live' | 'manual'>('live');

  // --- Scientific Magnus-Tetens formula for Absolute Humidity (g/m³) ---
  const calculateAbsoluteHumidity = (temp: number, relHumidity: number): number => {
    const saturationVaporPressure = 6.112 * Math.exp((17.67 * temp) / (temp + 243.5));
    const actualVaporPressure = saturationVaporPressure * (relHumidity / 100);
    const absHum = (actualVaporPressure * 100 * 2.1674) / (273.15 + temp);
    return Math.max(0.1, parseFloat(absHum.toFixed(2)));
  };

  // --- Fetch Live Real-Time Data for Coordinates ---
  const fetchLiveEnvironmentalData = async (
    lat: number, 
    lon: number, 
    locationName: string = currentLocation.name, 
    country: string = currentLocation.country
  ) => {
    setIsFetchingLive(true);
    try {
      // 1. Fetch live weather & soil/precipitation metrics
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_1cm`
      );

      // 2. Fetch live atmospheric air quality metrics
      const aqiRes = await axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=nitrogen_dioxide,pm10,pm2_5,carbon_monoxide`
      );

      const currentW = weatherRes.data?.current || {};
      const currentAQ = aqiRes.data?.current || {};

      const temp = currentW.temperature_2m ?? 24.0;
      const rh = currentW.relative_humidity_2m ?? 50.0;
      const calculatedAH = calculateAbsoluteHumidity(temp, rh);
      const no2Val = currentAQ.nitrogen_dioxide ?? 35.0;
      const pm25Val = currentAQ.pm2_5 ?? 30.0;
      const estimatedNox = Math.round(no2Val * 2.1 + (pm25Val * 0.4));
      const rain = currentW.precipitation ?? currentW.rain ?? 0.0;
      const soilM = currentW.soil_moisture_0_to_1cm ?? 0.3;
      const wind = currentW.wind_speed_10m ?? 8.0;

      const updatedLive: EnvironmentalSensors = {
        temperature: temp,
        humidity: rh,
        absHumidity: calculatedAH,
        no2: parseFloat(no2Val.toFixed(1)),
        nox: parseFloat(estimatedNox.toFixed(1)),
        pm25: parseFloat(pm25Val.toFixed(1)),
        precipitation: parseFloat(rain.toFixed(1)),
        soilMoisture: parseFloat(soilM.toFixed(2)),
        windSpeed: parseFloat(wind.toFixed(1))
      };

      setLiveSensors(updatedLive);
      setCurrentLocation({ name: locationName, country, lat, lon });
      setLastUpdated(new Date().toLocaleTimeString());

      // Update AI input parameters
      const newAirData: AirQualityData = {
        T: temp,
        RH: rh,
        AH: calculatedAH,
        NOx_GT: estimatedNox,
        NO2_GT: parseFloat(no2Val.toFixed(1))
      };
      setAirData(newAirData);

      // Compute dynamic flood variables from live weather
      const monsoonScale = Math.min(10, Math.max(1, Math.round(rain * 1.5 + (rh > 75 ? 3 : 1))));
      const drainageScale = Math.min(10, Math.max(1, Math.round((1 - soilM) * 10)));
      const newFloodData: FloodData = {
        MonsoonIntensity: monsoonScale,
        RiverManagement: 5,
        Deforestation: 6,
        Urbanization: 7,
        ClimateChange: temp > 32 ? 8 : 5,
        DamsQuality: 5,
        DrainageSystems: drainageScale
      };
      setFloodData(newFloodData);

      // Trigger automated AI inferences on the backend
      await runPredictions(newAirData, newFloodData);

    } catch (err) {
      console.error('Failed to fetch real-time live environmental data:', err);
    } finally {
      setIsFetchingLive(false);
    }
  };

  // --- Run AI Predictions ---
  const runPredictions = async (airPayload: AirQualityData = airData, floodPayload: FloodData = floodData) => {
    // 1. Air Quality AI Prediction
    setAirLoading(true);
    try {
      const res = await axios.post('/predict/air-quality', airPayload);
      setAirPrediction(res.data);
    } catch (err) {
      console.warn('Air Quality Prediction error:', err);
    } finally {
      setAirLoading(false);
    }

    // 2. Flood Risk AI Prediction
    setFloodLoading(true);
    try {
      const res = await axios.post('/predict/flood', floodPayload);
      setFloodPrediction(res.data);
    } catch (err) {
      console.warn('Flood Prediction error:', err);
    } finally {
      setFloodLoading(false);
    }
  };

  // --- City Search Handler ---
  const handleCitySearch = async (query: string) => {
    setIsFetchingLive(true);
    try {
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      );

      if (geoRes.data?.results && geoRes.data.results.length > 0) {
        const place = geoRes.data.results[0];
        await fetchLiveEnvironmentalData(place.latitude, place.longitude, place.name, place.country || '');
      } else {
        alert(`Could not find coordinates for "${query}". Try another major city.`);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      alert('Error searching for city coordinates.');
    } finally {
      setIsFetchingLive(false);
    }
  };

  // --- Device GPS Geolocation Handler ---
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsFetchingLive(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchLiveEnvironmentalData(latitude, longitude, 'My Location (GPS)', '');
      },
      (err) => {
        console.error('GPS error:', err);
        alert('Could not access device location. Please check browser permissions.');
        setIsFetchingLive(false);
      }
    );
  };

  // Initial live data load on mount
  useEffect(() => {
    fetchLiveEnvironmentalData(currentLocation.lat, currentLocation.lon, currentLocation.name, currentLocation.country);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-forest-950 border border-forest-800 rounded-lg text-forest-400">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white font-mono">
              ENVIRONMENTAL & HAZARD INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-charcoal-450 mt-1 font-mono">
            EcoMonitor AI • Real-Time Atmospheric Telemetry, Air Quality & Flood Machine Learning Models
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMetricsOpen(true)}
            className="px-3.5 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-750 text-charcoal-300 hover:text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-forest-400" />
            <span>Model Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => fetchLiveEnvironmentalData(currentLocation.lat, currentLocation.lon, currentLocation.name, currentLocation.country)}
            disabled={isFetchingLive}
            className="px-3.5 py-1.5 bg-forest-600 hover:bg-forest-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-forest-950"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin' : ''}`} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* 1. Global City Search & Location Controller */}
      <LocationSelector
        currentLocation={currentLocation}
        lastUpdated={lastUpdated}
        isFetching={isFetchingLive}
        onSelectCity={(lat, lon, name, country) => fetchLiveEnvironmentalData(lat, lon, name, country)}
        onSearchCity={handleCitySearch}
        onUseGps={handleUseGps}
      />

      {/* 2. Live Atmospheric & Environmental Sensor Telemetry Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold font-mono tracking-wider text-charcoal-300 uppercase flex items-center gap-2">
            <Globe className="w-4 h-4 text-forest-400" />
            <span>Atmospheric & Weather Feeds — {currentLocation.name}</span>
          </h2>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Open-Meteo Integration
          </span>
        </div>
        <EnvironmentalSensorsGrid sensors={liveSensors} />
      </div>

      {/* 3. Dual AI Predictor Cards (Air Quality + Flood Risk) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AirQualityCard
          data={airData}
          prediction={airPrediction}
          loading={airLoading}
          mode={airMode}
          onModeChange={setAirMode}
          onDataChange={setAirData}
          onPredict={() => runPredictions(airData, floodData)}
        />

        <FloodRiskCard
          data={floodData}
          prediction={floodPrediction}
          loading={floodLoading}
          mode={floodMode}
          onModeChange={setFloodMode}
          onDataChange={setFloodData}
          onPredict={() => runPredictions(airData, floodData)}
        />
      </div>

      {/* Training Metrics Inspection Modal */}
      <TrainingMetricsModal
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
      />
    </div>
  );
};

export default Environmental;
