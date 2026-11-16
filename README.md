# 🌲 EcoSentinel AI — Integrated Environmental, Wildfire & Forest Intelligence Platform

An enterprise-grade, multi-domain AI platform that unifies **Environmental Hazard Intelligence (Air Quality & Flood Risk ML)**, **Wildfire & Emergency Incident Response (Dual-model SAINet + YOLOv8)**, and **AETHER Satellite Deforestation Detection (U-Net & Spatial Analysis)** into a single full-stack web system.

---

## 📌 Merged Repositories & Capabilities

This platform represents the systematic merger of three specialized systems:

1. **Environmental Monitoring Platform (`ai_cp`)**:
   - Machine learning models for **Air Quality Prediction** (CO concentration & AQI status).
   - Machine learning models for **Flood Risk Classification & Probability**.
   - Live atmospheric telemetry feeds (Open-Meteo weather & air quality APIs).
   - Scientific Magnus-Tetens formula for real-time Absolute Humidity calculation.
   - UCI training pipeline (`train_models.py`) with pre-trained Joblib models.

2. **Wildfire Intelligence & Incident Command Platform (`Forest-management`)**:
   - Dual-model real-time detector:
     - **SAINet v11.1**: High-recall smoke and fire detection.
     - **YOLOv8n**: Situational context detection (persons, vehicles, machinery, animals).
   - Incident & Alert Engine: persistence tracking, geo-radius correlation, severity calculation (0-5), action checklists, audit trail.
   - Real-time bi-directional **WebSocket stream (`/ws`)** for instantaneous alert and detection broadcast.
   - 3D Fire visualizer, interactive camera detection overlay, fire cursor, heatmap view, role-based alert modals, and high-impact landing page.

3. **Forest Monitoring & AETHER Deforestation AI (`AI-project`)**:
   - Comprehensive multi-view tactical operations dashboard:
     - **Overview**: Real-time status, KPIs, GIS map, and AI core agent logs.
     - **Live Monitoring**: Multi-camera grid with simulated detection overlays.
     - **Forest Map**: Leaflet GIS map with zone layers, fire perimeters, and sensor nodes.
     - **Fire Intelligence**: Fire Weather Index (FWI), wind vectors, fuel moisture, slope analysis.
     - **Deforestation**: Bi-temporal satellite image pair uploader, U-Net mask viewer, hotspot grid, and regional priority tables.
     - **IoT Sensors**: Telemetry grid, battery levels, signal strength, alert flags.
     - **Alerts**: Real-time alarm triage, severity filtering, audit history.
     - **Analytics**: Historical trend visualizations and sensor correlation charts.
     - **Command Center**: Real-time operational incident console backed by the unified backend.
   - Stage 1-7 research reports and training scripts for U-Net & temporal CNN-LSTM models.

---

## 🏗️ System Architecture

```
ai_combine_cp/
├── backend/
│   ├── data/                           # Datasets & persisted state
│   │   ├── air_quality_dataset.csv
│   │   ├── flood_risk_dataset.csv
│   │   ├── training_metrics.json
│   │   ├── detections.json
│   │   └── incidents.json
│   ├── models/                         # Serialized ML models
│   │   ├── air_quality_model.joblib
│   │   └── flood_model.joblib
│   ├── routers/                        # Modular FastAPI Domain Routers
│   │   ├── environmental.py            # Air Quality & Flood Risk endpoints
│   │   ├── wildfire.py                 # Wildfire detection, incidents & WebSocket
│   │   └── deforestation.py            # AETHER deforestation analysis & masks
│   ├── AETHER-Deforestation/           # U-Net research, evaluation & stage reports
│   ├── schemas.py                      # Unified Pydantic type definitions
│   ├── main.py                         # Master FastAPI application entry point
│   ├── train_models.py                 # UCI dataset training script
│   └── requirements.txt                # Unified Python backend dependencies
│
├── frontend/
│   ├── public/                         # Video & static assets
│   │   ├── fire.mp4                    # Wildfire landing video
│   │   └── ...
│   ├── src/
│   │   ├── components/
│   │   │   ├── environmental/          # EcoMonitor AI components
│   │   │   │   ├── AirQualityCard.tsx
│   │   │   │   ├── FloodRiskCard.tsx
│   │   │   │   ├── EnvironmentalSensorsGrid.tsx
│   │   │   │   ├── LocationSelector.tsx
│   │   │   │   └── TrainingMetricsModal.tsx
│   │   │   ├── DetectionOverlay.tsx    # Live camera detection boxes
│   │   │   ├── FireCursor.tsx          # Particle cursor effect
│   │   │   ├── HeatmapView.tsx         # Incident density heatmap
│   │   │   ├── RoleAlertModal.tsx      # Role-based alert modal
│   │   │   ├── LandingPage.tsx         # 3D landing page
│   │   │   └── ...                     # Deforestation uploader, cards, charts
│   │   ├── context/
│   │   │   └── DashboardContext.tsx    # Shared telemetry, incidents & WebSocket
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx     # Tactical sidebar shell
│   │   ├── pages/
│   │   │   ├── Overview.tsx            # Main operations dashboard
│   │   │   ├── Environmental.tsx       # EcoMonitor AI (Air & Flood Prediction)
│   │   │   ├── LiveMonitoring.tsx      # Video feeds & detection stream
│   │   │   ├── ForestMap.tsx           # GIS Leaflet interactive map
│   │   │   ├── FireIntelligence.tsx    # Wildfire analytics & FWI metrics
│   │   │   ├── Deforestation.tsx       # AETHER satellite change analysis
│   │   │   ├── IoTSensors.tsx          # Ground sensor telemetry network
│   │   │   ├── Alerts.tsx              # Alert notification center
│   │   │   ├── Analytics.tsx           # Multi-variable trend analytics
│   │   │   ├── Reports.tsx             # PDF/Data export reporting
│   │   │   ├── Settings.tsx            # System parameters & thresholds
│   │   │   ├── CommandCenter.tsx       # Unified operational incident console
│   │   │   └── Landing.tsx             # Fullscreen 3D entry page
│   │   ├── App.tsx                     # React router setup
│   │   └── main.tsx                    # React DOM entry
│   ├── package.json                    # Frontend dependencies
│   ├── tailwind.config.js              # Charcoal & tactical styling
│   └── vite.config.ts                  # Vite build & API proxy setup
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.9+) & `pip`
- (Optional) CUDA-enabled GPU for accelerated PyTorch / YOLOv8 inference

---

### Step 1: Set Up & Run the Master Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the unified backend server:
   ```bash
   python main.py
   ```
   *Or with Uvicorn:*
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   - The master API will be running at: `http://localhost:8000`
   - Interactive Swagger API Documentation: `http://localhost:8000/docs`
   - Real-time WebSocket: `ws://localhost:8000/ws`

*(Optional) To retrain the Environmental Air Quality & Flood models:*
```bash
python train_models.py
```

---

### Step 2: Set Up & Run the Unified Frontend (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open your browser at: `http://localhost:5173`

---

## 🌟 Interactive Features & Navigation

- **`/` (Overview)**: Real-time mission control view with active fire counts, canopy loss indicators, active GIS map, and AI core logs.
- **`/environmental` (Environmental & Risk)**: Complete EcoMonitor AI suite with global city search, GPS coordinates, live Open-Meteo weather and air quality telemetry, Air Quality ML prediction card, and Flood Risk ML prediction card.
- **`/live` (Live Monitoring)**: Multi-camera grid with simulated and real-time detection overlays.
- **`/map` (Forest Map)**: Full-screen interactive Leaflet map with fire zones, IoT sensor locations, and heatmaps.
- **`/fire-intelligence` (Fire Intelligence)**: In-depth Fire Weather Index (FWI), wind vectors, fuel moisture analysis, and risk forecasts.
- **`/deforestation` (Deforestation)**: Satellite bi-temporal imagery uploader (480×480 RGB), U-Net segmentation mask viewer, 4×4 hotspot grid, and regional priority ranking.
- **`/sensors` (IoT Sensors)**: Sensor network status, battery levels, temperature, humidity, and soil telemetry.
- **`/alerts` (Alerts)**: Centralized alert log with severity levels and action options.
- **`/command-center` (Command Center)**: Real-time incident command console connected to the backend WebSocket stream.
- **`/landing` (Landing Page)**: Full-screen 3D landing experience with fire video background, live stats, and role selection modal.

---

## 📦 Model Weights & Deep Learning Checkpoints

To ensure the repository remains lightweight and within standard Git limits:
- Core scikit-learn models (`air_quality_model.joblib`, `flood_model.joblib`) are pre-trained and included in `backend/models/`.
- Large deep learning weights (`SAINet_v11.1.pt`, `yolov8n.pt`, `best_model.pth`) can be placed in `backend/models/` and are excluded from Git commits via `.gitignore`.
- If deep learning weights are not present, the backend automatically provides graceful heuristic and computer vision fallbacks so all UI views remain interactive.
