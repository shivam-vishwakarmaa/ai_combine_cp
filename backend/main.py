"""
EcoSentinel AI — Unified Master Backend
========================================
Combines:
  1. EcoMonitor AI (Air Quality & Flood Risk Machine Learning Services)
  2. Wildfire Intelligence Platform (Dual-model SAINet/YOLOv8 & Incident WebSocket Engine)
  3. AETHER Deforestation AI (Satellite Change Detection & Spatial Intelligence)
"""
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from routers.environmental import router as environmental_router
from routers.wildfire import router as wildfire_router
from routers.deforestation import router as deforestation_router

app = FastAPI(
    title="EcoSentinel AI — Integrated Environmental & Forest Intelligence Platform",
    version="2.0.0",
    description=(
        "Enterprise-grade platform integrating real-time environmental hazard prediction, "
        "dual-model wildfire detection & incident dispatch, and satellite deforestation spatial analytics."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# Comprehensive CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all domain routers
app.include_router(environmental_router)
app.include_router(wildfire_router)
app.include_router(deforestation_router)


@app.get("/", summary="Platform Root Metadata")
def root_status():
    return {
        "platform": "EcoSentinel AI",
        "version": "2.0.0",
        "status": "online",
        "modules": {
            "environmental": {
                "name": "EcoMonitor AI",
                "capabilities": ["Air Quality Index & CO Prediction", "Flood Risk Classification & Probability"],
                "endpoints": ["/predict/air-quality", "/predict/flood", "/training-metrics"],
            },
            "wildfire": {
                "name": "Wildfire Intelligence Platform",
                "capabilities": ["SAINet Flame/Smoke Detection", "YOLOv8 Situational Context", "Incident State Machine", "WebSocket Realtime Stream"],
                "endpoints": ["/api/frame", "/api/detect", "/api/incidents", "/ws", "/api/simulation/start"],
            },
            "deforestation": {
                "name": "AETHER Deforestation AI",
                "capabilities": ["Satellite Bi-temporal Change Detection", "Binary Segmentation Mask", "4x4 Grid Hotspot Clustering"],
                "endpoints": ["/api/v1/deforestation/analyze", "/api/v1/deforestation/predict-mask", "/api/v1/model"],
            },
        },
        "docs_url": "/docs",
    }


@app.get("/health", summary="Unified System Health")
def unified_health():
    return {
        "status": "healthy",
        "service": "EcoSentinel AI Master Backend",
        "environmental_engine": "online",
        "wildfire_engine": "online",
        "deforestation_engine": "online",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
