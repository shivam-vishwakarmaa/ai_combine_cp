"""
Environmental Monitoring Router — EcoMonitor AI
================================================
Handles:
  • Air Quality Index & CO concentration predictions from ambient telemetry
  • Flood Risk classification & probability evaluation
  • Model training metrics delivery
"""
import os
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
import joblib
import pandas as pd
from schemas import AirQualityRequest, FloodRequest

router = APIRouter(tags=["Environmental Intelligence"])

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

air_model_data = None
flood_model_data = None

# Attempt to load trained models
try:
    air_model_path = MODELS_DIR / "air_quality_model.joblib"
    if air_model_path.exists():
        air_model_data = joblib.load(str(air_model_path))
        print("[EcoMonitor] Air Quality Model successfully loaded.")
    else:
        print(f"[EcoMonitor] Notice: {air_model_path} not found.")
except Exception as e:
    print(f"[EcoMonitor] Warning: Failed to load Air Quality model: {e}")

try:
    flood_model_path = MODELS_DIR / "flood_model.joblib"
    if flood_model_path.exists():
        flood_model_data = joblib.load(str(flood_model_path))
        print("[EcoMonitor] Flood Model successfully loaded.")
    else:
        print(f"[EcoMonitor] Notice: {flood_model_path} not found.")
except Exception as e:
    print(f"[EcoMonitor] Warning: Failed to load Flood model: {e}")


@router.post("/predict/air-quality")
@router.post("/api/environmental/predict-air")
def predict_air_quality(data: AirQualityRequest):
    """Predict CO concentration (mg/m³) and Air Quality condition based on ambient telemetry."""
    if not air_model_data:
        # Fallback heuristic calculation if model weights unavailable
        pred_co = max(0.2, (data.NO2_GT * 0.02) + (data.NOx_GT * 0.01) + (data.T * 0.015))
        status = "Good" if pred_co < 2.0 else ("Moderate" if pred_co < 5.0 else "Hazardous")
        return {
            "prediction_CO_GT": round(float(pred_co), 3),
            "status": status,
            "engine": "heuristic_fallback"
        }
        
    model = air_model_data['model']
    imputer = air_model_data['imputer']
    
    # Map request payload to dataframe using exact feature names
    input_data = pd.DataFrame([{
        'T': data.T,
        'RH': data.RH,
        'AH': data.AH,
        'NOx(GT)': data.NOx_GT,
        'NO2(GT)': data.NO2_GT
    }])
    
    input_imputed = imputer.transform(input_data)
    prediction = model.predict(input_imputed)[0]
    
    return {
        "prediction_CO_GT": round(float(prediction), 4),
        "status": "Good" if prediction < 2.0 else ("Moderate" if prediction < 5.0 else "Hazardous"),
        "engine": "scikit_random_forest"
    }


@router.post("/predict/flood")
@router.post("/api/environmental/predict-flood")
def predict_flood(data: FloodRequest):
    """Predict flood probability and risk classification based on monsoon, urban, and environmental factors."""
    if not flood_model_data:
        # Fallback heuristic calculation
        score = (
            data.MonsoonIntensity * 0.35 +
            data.Deforestation * 0.2 +
            data.Urbanization * 0.2 +
            (11 - data.DrainageSystems) * 0.15 +
            (11 - data.DamsQuality) * 0.1
        ) / 10.0
        prob = min(0.99, max(0.01, score / 1.5))
        is_high = 1 if prob >= 0.5 else 0
        return {
            "flood_risk_prediction": is_high,
            "risk_label": "High Risk" if is_high == 1 else "Low Risk",
            "probability_high_risk": round(float(prob), 4),
            "engine": "heuristic_fallback"
        }
        
    model = flood_model_data['model']
    features = flood_model_data['features']
    
    input_dict = data.model_dump()
    row = {feat: input_dict.get(feat, 5) for feat in features}
    input_data = pd.DataFrame([row])
    
    prediction = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]
    
    return {
        "flood_risk_prediction": int(prediction),
        "risk_label": "High Risk" if prediction == 1 else "Low Risk",
        "probability_high_risk": round(float(probabilities[1]), 4),
        "engine": "scikit_random_forest"
    }


@router.get("/training-metrics")
@router.get("/api/environmental/training-metrics")
def get_training_metrics():
    """Retrieve model training benchmarks, accuracy, and evaluation metrics."""
    metrics_path = DATA_DIR / "training_metrics.json"
    if metrics_path.exists():
        with open(metrics_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "status": "partial",
        "message": "Metrics report not found. Execute train_models.py to train models on the UCI dataset."
    }
