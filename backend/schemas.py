"""
Unified Platform Schemas — Pydantic API Models
===============================================
Single source of truth for:
  1. Environmental Monitoring (Air Quality & Flood Risk ML Models)
  2. Wildfire Intelligence & Incident Response Platform (SAINet + YOLOv8)
  3. AETHER Deforestation Detection & Spatial Analysis
"""
from __future__ import annotations
from typing import Any, Dict, List, Literal, Optional, Tuple, Union
from pydantic import BaseModel, Field


# ============================================================================
# 1. ENVIRONMENTAL MONITORING SCHEMAS (EcoMonitor AI)
# ============================================================================

class AirQualityRequest(BaseModel):
    T: float = Field(..., description="Temperature (°C)")
    RH: float = Field(..., description="Relative Humidity (%)")
    AH: float = Field(..., description="Absolute Humidity (g/m³)")
    NOx_GT: float = Field(..., description="NOx concentration (ppb)")
    NO2_GT: float = Field(..., description="NO2 concentration (µg/m³)")


class AirQualityResponse(BaseModel):
    prediction_CO_GT: float
    status: Literal["Good", "Moderate", "Hazardous"]


class FloodRequest(BaseModel):
    MonsoonIntensity: int = Field(5, ge=1, le=10)
    RiverManagement: int = Field(5, ge=1, le=10)
    Deforestation: int = Field(5, ge=1, le=10)
    Urbanization: int = Field(5, ge=1, le=10)
    ClimateChange: int = Field(5, ge=1, le=10)
    DamsQuality: int = Field(5, ge=1, le=10)
    DrainageSystems: int = Field(5, ge=1, le=10)


class FloodResponse(BaseModel):
    flood_risk_prediction: int
    risk_label: Literal["High Risk", "Low Risk"]
    probability_high_risk: float


# ============================================================================
# 2. WILDFIRE INTELLIGENCE & INCIDENT MANAGEMENT SCHEMAS
# ============================================================================

Role = Literal[
    "CITIZEN", "FIREFIGHTER", "FOREST_OFFICIAL",
    "EMERGENCY_OPERATOR", "DISASTER_MANAGER", "ADMIN", "OBSERVER",
]

IncidentState = Literal[
    "CREATED", "OBSERVING", "PERSISTENT", "AWAITING_VERIFICATION",
    "ACKNOWLEDGED", "ESCALATED", "VERIFIED_INCIDENT",
    "ACTIVE_EMERGENCY", "RESOLVED", "FALSE_POSITIVE",
]

SeverityLabel = Literal[
    "NORMAL", "AI_OBSERVATION", "PERSISTENT_DETECTION",
    "POTENTIAL_WILDFIRE", "VERIFIED_INCIDENT", "ACTIVE_EMERGENCY",
]

SeverityLevel = Literal[0, 1, 2, 3, 4, 5]
AlertPriority = Literal["INFO", "WARNING", "HIGH", "CRITICAL"]
DetectionClass = str
SourceType = Literal["camera", "user", "sensor"]
Relation = Literal["primary", "corroborating"]


class GeoPoint(BaseModel):
    lat: float
    lon: float


class Detection(BaseModel):
    id: str
    ts: str
    source_id: str
    source_type: SourceType = "camera"
    cls: DetectionClass = Field(alias="class")
    confidence: float
    location: GeoPoint
    bbox: Optional[List[float]] = None
    note: Optional[str] = None
    category: Optional[str] = None
    display_label: Optional[str] = None

    class Config:
        populate_by_name = True


class IncidentSource(BaseModel):
    detection_id: str
    source_id: str
    cls: DetectionClass = Field(alias="class")
    confidence: float
    ts: str
    relation: Relation = "corroborating"

    class Config:
        populate_by_name = True


class TimelineEntry(BaseModel):
    ts: str
    event: str
    detail: str


class ChecklistItem(BaseModel):
    key: str
    label: str
    done: bool = False


class IncidentNote(BaseModel):
    ts: str
    actor: str
    text: str


class PersistenceInfo(BaseModel):
    persistent: bool = False
    duration: float = 0.0
    count: int = 0


class Incident(BaseModel):
    id: str
    created_at: str
    updated_at: str
    state: IncidentState
    severity: SeverityLevel
    severity_label: SeverityLabel
    location: GeoPoint
    primary_class: DetectionClass
    confidence: float
    persistence: PersistenceInfo
    sources: List[IncidentSource]
    timeline: List[TimelineEntry]
    checklist: List[ChecklistItem]
    notes: List[IncidentNote] = []
    acknowledged_by: Optional[str] = None
    assigned_to: Optional[str] = None
    ai_summary: Optional[str] = None


class Recipient(BaseModel):
    role: Role
    group: str
    reason: str


class Alert(BaseModel):
    id: str
    incident_id: str
    priority: AlertPriority
    reason: str
    role: Role
    recipients: List[Recipient]
    title: str
    body: str
    actions: List[str]
    created_at: str


class AuditEntry(BaseModel):
    ts: str
    event: str
    incident_id: Optional[str] = None
    source: Optional[str] = None
    role: Optional[Role] = None
    extra: Optional[Dict[str, Any]] = None


class IncidentActionRequest(BaseModel):
    action: Literal[
        "acknowledge", "assign", "escalate", "verify",
        "false_positive", "resolve", "note", "checklist",
    ]
    actor: str
    role: Role
    assignee: Optional[str] = None
    text: Optional[str] = None
    key: Optional[str] = None
    done: Optional[bool] = None


class UserReportRequest(BaseModel):
    type: Literal[
        "smoke", "fire", "strong_smoke_smell",
        "blocked_road", "fallen_tree", "other",
    ]
    description: str = ""
    location: Optional[GeoPoint] = None


class TestAlertRequest(BaseModel):
    role: Role
    incident_id: Optional[str] = None


class ConfigResponse(BaseModel):
    severity_model: Dict[int, str]
    priorities: Dict[str, int]
    roles: List[Role]
    escalation: List[Dict[str, Any]]
    notification_mode: str
    persistence_seconds: float
    correlation_radius_m: float


# ============================================================================
# 3. AETHER DEFORESTATION SCHEMAS
# ============================================================================

class RootResponse(BaseModel):
    name: str = Field(..., example="EcoSentinel Integrated AI Platform")
    version: str = Field(..., example="2.0.0")
    module: str = Field(..., example="Environmental, Wildfire & Deforestation Intelligence")
    stage: str = Field(..., example="Production")
    status: str = Field(..., example="online")


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    model_loaded: bool = Field(..., example=True)
    model_integrity: str = Field(..., example="PASS")
    model: str = Field(..., example="Stage2B-EarlyFusion-U-Net")
    threshold: float = Field(..., example=0.25)
    device: str = Field(..., example="cpu")


class ModelInfoResponse(BaseModel):
    model_name: str = Field(..., example="Stage2B Early-Fusion U-Net")
    architecture: str = Field(..., example="6-channel Early-Fusion U-Net")
    checkpoint: str = Field(..., example="checkpoints/stage2b/best_model.pth")
    threshold: float = Field(..., example=0.25)
    input_channels: int = Field(..., example=6)
    input_size: Tuple[int, int] = Field(..., example=(480, 480))
    output_channels: int = Field(..., example=1)
    checkpoint_sha256: str = Field(..., example="daaafa0e8f3ceb4041fb3c28ead53ee9151c559bf0551e4a9e06c40248f0c98b")
    device: str = Field(..., example="cpu")
    eval_mode: bool = Field(..., example=True)


class RegionDetail(BaseModel):
    region_id: int = Field(..., example=1)
    pixel_count: int = Field(..., example=1200)
    percentage_of_image: float = Field(..., example=0.5208)
    centroid_x: float = Field(..., example=145.2)
    centroid_y: float = Field(..., example=210.8)
    bbox_x_min: int = Field(..., example=100)
    bbox_y_min: int = Field(..., example=180)
    bbox_x_max: int = Field(..., example=190)
    bbox_y_max: int = Field(..., example=240)
    region_contribution_percent: float = Field(..., example=25.5)
    rank: int = Field(..., example=1)


class GridCellDetail(BaseModel):
    grid_id: str = Field(..., example="grid_r0_c0")
    grid_row: int = Field(..., example=0)
    grid_col: int = Field(..., example=0)
    x_min: int = Field(..., example=0)
    y_min: int = Field(..., example=0)
    x_max: int = Field(..., example=119)
    y_max: int = Field(..., example=119)
    predicted_deforestation_pixels: int = Field(..., example=500)
    predicted_deforestation_percent_of_cell: float = Field(..., example=3.4722)
    predicted_deforestation_percent_of_image: float = Field(..., example=0.217)
    number_of_regions_intersecting_cell: int = Field(..., example=2)
    largest_region_pixels_in_cell: int = Field(..., example=350)
    hotspot_score: float = Field(..., example=12.5)
    hotspot_level: str = Field(..., example="Low")


class PriorityDetail(BaseModel):
    normalized_deforestation_score: float = Field(..., example=100.0)
    normalized_largest_region_score: float = Field(..., example=69.17)
    normalized_region_count_score: float = Field(..., example=27.12)
    priority_score: float = Field(..., example=78.28)
    priority_level: str = Field(..., example="Critical")


class DeforestationSummary(BaseModel):
    image_width: int = Field(..., example=480)
    image_height: int = Field(..., example=480)
    predicted_pixels: int = Field(..., example=45428)
    predicted_percentage: float = Field(..., example=19.717)
    region_count: int = Field(..., example=32)
    largest_region_pixels: int = Field(..., example=11498)
    largest_region_percentage: float = Field(..., example=4.9905)
    concentration: str = Field(..., example="Dispersed")
    regions_per_100k_pixels: float = Field(..., example=13.8889)
    fragmentation_ratio: float = Field(..., example=0.000704)
    priority_score: float = Field(..., example=78.28)
    priority_level: str = Field(..., example="Critical")


class DeforestationAnalysisResponse(BaseModel):
    status: str = Field(..., example="success")
    request_id: str = Field(..., example="req_12345678")
    model: Dict[str, Any]
    summary: DeforestationSummary
    regions: List[RegionDetail]
    grid_hotspots: List[GridCellDetail]


class PredictMaskResponse(BaseModel):
    status: str = Field(..., example="success")
    mask_id: str = Field(..., example="mask_12345678.png")
    mask_download_url: str = Field(..., example="/api/v1/deforestation/mask/mask_12345678.png")
    summary: DeforestationSummary


class ErrorResponse(BaseModel):
    detail: str = Field(..., example="Invalid file size or format.")
    error_code: str = Field(..., example="VALIDATION_ERROR")
