# FarmWise Integration

This package is the integration layer for the existing FarmWise repository.

## Keep these existing backend files unchanged
- `simulation_engine.py`
- `data/crops.json`
- `data/soils.json`
- `data/weather_profiles.json`
- `data/regional_profiles.json`

Replace the files in this package into the matching paths in the repository.

## Backend
From the repository root:

```powershell
python -m uvicorn api.main:app --reload
```

Backend:
`http://127.0.0.1:8000`

Swagger:
`http://127.0.0.1:8000/docs`

Endpoints:
- `GET /api/health`
- `POST /api/simulate`
- `POST /api/simulate/compare`

## Frontend
Node.js is required only when you want to run/build the React frontend.

```powershell
npm install
npm run dev
```

The frontend defaults to:
`http://127.0.0.1:8000`

To use another backend:

```powershell
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev
```

The frontend performs no simulation math. It sends farm inputs to FastAPI and displays the SimulationEngine result.
