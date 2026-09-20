"""
FarmWise FastAPI Backend Layer
Agri PS01: Scenario & Decision Simulator
DSSA PRARAMBHA 2.0 Hackathon
"""

import os
import sys
from typing import Any, Dict, Optional, Union

# Ensure repository root is on sys.path so simulation_engine can be imported reliably
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from simulation_engine import SimulationEngine

app = FastAPI(
    title="FarmWise Simulation API",
    description="Agro-Climatic Scenario & Decision Simulation Engine API for Indian Agriculture.",
    version="1.0.0",
)

# Enable CORS for React frontend (Vite, CRA, Next.js, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine instance once at module load
engine = SimulationEngine()


class SimulateRequest(BaseModel):
    """
    Pydantic schema validating input parameters for FarmWise simulation engine.
    Matches the input requirements of SimulationEngine.simulate().
    """
    crop: str = Field(
        default="wheat",
        description="Target crop name or identifier (e.g. 'wheat', 'rice', 'jowar', 'cotton', 'maize', 'sugarcane', 'soybean', 'groundnut')",
        examples=["wheat"]
    )
    scenario_name: Optional[str] = Field(
        default="Scenario",
        description="User-defined name or label for this simulation scenario",
        examples=["Maharashtra Wheat Scenario"]
    )
    state: Optional[str] = Field(
        default=None,
        description="Target Indian state (e.g. 'punjab', 'haryana', 'maharashtra', 'madhya_pradesh', 'uttar_pradesh', 'rajasthan', 'karnataka', 'tamil_nadu', 'gujarat')",
        examples=["maharashtra"]
    )
    region: Optional[str] = Field(
        default=None,
        description="Alias for state parameter",
        examples=["maharashtra"]
    )
    soil: Optional[str] = Field(
        default=None,
        description="Soil type (e.g. 'alluvial_loam', 'black_soil', 'red_sandy_loam', 'clay_loam', 'sandy_soil'). Defaults to state's native soil if omitted.",
        examples=["black_soil"]
    )
    farm_size_ha: Optional[float] = Field(
        default=None,
        gt=0,
        description="Farm size in hectares (must be > 0)",
        examples=[1.0]
    )
    farm_size_acres: Optional[float] = Field(
        default=None,
        gt=0,
        description="Farm size in acres (must be > 0, converted to hectares if farm_size_ha is omitted)",
        examples=[2.47]
    )
    farm_size: Optional[float] = Field(
        default=None,
        gt=0,
        description="General farm size in hectares (must be > 0)",
        examples=[1.0]
    )
    water_availability: Optional[Union[float, int, str]] = Field(
        default=100.0,
        description="Water availability percentage of requirement (0 to 250, where 100 = 100% of requirement) or descriptive mode ('severe_deficit', 'moderate_deficit', 'adequate', 'surplus', 'excessive', '100%')",
        examples=[100]
    )
    water_ratio: Optional[float] = Field(
        default=None,
        ge=0,
        description="Explicit water ratio (e.g. 1.0 for 100%, 0.75 for 75%)",
        examples=[1.0]
    )
    weather: Optional[str] = Field(
        default="normal",
        description="Seasonal weather scenario ('optimal', 'normal', 'moderate_heatwave', 'severe_drought', 'unseasonal_rain')",
        examples=["normal"]
    )
    planting_date: Optional[str] = Field(
        default="optimal",
        description="Planting timeliness window ('optimal', 'early', 'late', 'very_late')",
        examples=["optimal"]
    )
    planting_schedule: Optional[str] = Field(
        default=None,
        description="Alias for planting_date",
        examples=["optimal"]
    )
    fertilizer: Optional[str] = Field(
        default="recommended",
        description="Fertilizer input intensity level ('low', 'moderate', 'recommended', 'high', 'excessive', 'organic')",
        examples=["recommended"]
    )
    input_usage: Optional[str] = Field(
        default=None,
        description="Alias for fertilizer",
        examples=["recommended"]
    )

    model_config = {
        "extra": "allow"
    }


@app.get("/", tags=["General"])
def root() -> Dict[str, Any]:
    """Root metadata endpoint."""
    return {
        "message": "Welcome to FarmWise Simulation API",
        "service": "farmwise-api",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "simulate_url": "/api/simulate"
    }


@app.get("/api/health", tags=["Health"])
def health_check() -> Dict[str, Any]:
    """Health check endpoint indicating service operational readiness."""
    return {
        "status": "healthy",
        "service": "farmwise-api",
        "engine": "SimulationEngine",
        "version": "1.0.0"
    }


@app.post("/api/simulate", tags=["Simulation"])
def run_simulation(request: SimulateRequest) -> Dict[str, Any]:
    """
    Simulate an agricultural crop scenario using the deterministic SimulationEngine.
    Validates input using Pydantic, passes inputs directly to SimulationEngine.simulate(),
    and returns the structured simulation result.
    """
    # Extract only provided (non-None) inputs to allow engine fallbacks & defaults
    scenario_inputs = {k: v for k, v in request.model_dump().items() if v is not None}

    try:
        result = engine.simulate(scenario_inputs)
        return result
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Simulation input validation error: {str(err)}"
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal simulation error: {str(err)}"
        )
