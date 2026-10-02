"""
FarmWise FastAPI backend
Agri PS01: Scenario & Decision Simulator
"""
import os
import sys
from typing import Any, Dict, Optional, Union

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from simulation_engine import SimulationEngine

app = FastAPI(
    title="FarmWise Simulation API",
    description="Scenario & Decision Simulator for Indian agriculture.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = SimulationEngine()


class SimulateRequest(BaseModel):
    crop: str = "wheat"
    scenario_name: Optional[str] = "Scenario"
    state: Optional[str] = None
    region: Optional[str] = None
    soil: Optional[str] = None
    farm_size_ha: Optional[float] = Field(default=None, gt=0)
    farm_size_acres: Optional[float] = Field(default=None, gt=0)
    farm_size: Optional[float] = Field(default=None, gt=0)
    water_availability: Optional[Union[float, int, str]] = 100.0
    water_ratio: Optional[float] = Field(default=None, ge=0)
    weather: Optional[str] = "normal"
    planting_date: Optional[str] = "optimal"
    planting_schedule: Optional[str] = None
    fertilizer: Optional[str] = "recommended"
    input_usage: Optional[str] = None

    model_config = {"extra": "allow"}


class CompareRequest(BaseModel):
    scenario_a: Dict[str, Any]
    scenario_b: Dict[str, Any]


@app.get("/")
def root() -> Dict[str, Any]:
    return {
        "message": "Welcome to FarmWise Simulation API",
        "service": "farmwise-api",
        "version": "1.1.0",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "simulate_url": "/api/simulate",
        "compare_url": "/api/simulate/compare",
    }


@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "farmwise-api",
        "engine": "SimulationEngine",
        "version": "1.1.0",
    }


def _simulate(payload: Dict[str, Any]) -> Dict[str, Any]:
    clean = {k: v for k, v in payload.items() if v is not None}
    try:
        return engine.simulate(clean)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Simulation input validation error: {err}",
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal simulation error: {err}",
        )


@app.post("/api/simulate")
def run_simulation(request: SimulateRequest) -> Dict[str, Any]:
    return _simulate(request.model_dump())


@app.post("/api/simulate/compare")
def compare_scenarios(request: CompareRequest) -> Dict[str, Any]:
    try:
        a = {k: v for k, v in request.scenario_a.items() if v is not None}
        b = {k: v for k, v in request.scenario_b.items() if v is not None}
        return engine.compare_scenarios(a, b)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Comparison input validation error: {err}",
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal comparison error: {err}",
        )
