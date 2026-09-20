# 🌾 FarmWise — Decision & Scenario Simulator
### *Agri PS01: Scenario & Decision Simulator — DSSA PRARAMBHA 2.0 Hackathon*

FarmWise is a transparent, explainable, and deterministic decision-support simulator for Indian agriculture. It allows farmers, agronomists, and policy planners to test farming decisions before making them—simulating how variations in climate, irrigation, soil compatibility, sowing dates, and fertilizer inputs impact **estimated yield, production costs, water allocation, multi-dimensional risk, and net farm profit**.

---

## 🌟 Core Architecture & Principles

Unlike black-box machine learning models that require ungeneralizable local data and cannot explain *why* an output changed, FarmWise uses a **Deterministic Multiplicative Stress-Index Framework** grounded in authoritative agricultural science:
- **FAO-33 Water Production Function** (*Doorenbos & Kassam, 1979*)
- **Liebig-Mitscherlich Law of Diminishing Returns** for nutrients
- **ICAR / CWC Crop Water Requirements & Packages of Practices**
- **CACP Cost of Cultivation (Cost A2+FL)** and Government MSP / FRP (2024–25 & 2025–26)

```
                       [ User Inputs ]
                              │
                    [ Crop Baseline Profile ]
                    (Base Yield, Water Req, NPK, MSP)
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    Soil Modifier       Water Modifier      Weather Modifier
       (f_soil)            (f_water)           (f_weather)
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
  Planting Date Modifier                  Input/Fertilizer Modifier
       (f_planting)                              (f_input)
          │                                       │
          └───────────────────┬───────────────────┘
                              │
                              ▼
                    [ Estimated Yield (t/ha) ]
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
[ Resource Engine ]     [ Cost & Profit ]       [ Risk Engine ]
  • Water Applied (m³)    • CACP Cost (₹)         • Strict Risk Score (0-100)
  • Rain vs Pumped Split  • Gross Return (₹)      • Category (Low/Med/High)
  • NPK Consumed (kg)     • Net Profit (₹)        • Top Risk Contributors
                              │
                              ▼
             [ Factor Impact & Scenario Engine ]
               • Chain-Linked Sequential Attribution (100% Reconciled)
               • Scenario A vs Scenario B Log-Ratio Attribution (Vartia)
               • Plain-English "Why It Changed" Explanation
```

---

## 📁 Repository Structure

```
farmwise/
├── data/
│   ├── crops.json               # 8 MVP crops: yield benchmarks, Ky, water req, NPK, MSP
│   ├── soils.json               # 5 major soil types & crop suitability matrices
│   ├── weather_profiles.json    # 5 seasonal weather shock profiles & risk scores
│   └── regional_profiles.json   # 12 real Indian states: zones, soils, rainfall shares
├── simulation_engine.py         # Complete deterministic SimulationEngine class
├── test_simulation.py           # Automated unit test suite (11 test suites, <5ms)
└── README.md
```

---

## 🚜 Supported MVP Crops (8 Crops)

1. **Rice (Paddy)** (*Oryza sativa*) — Kharif, semi-aquatic
2. **Wheat** (*Triticum aestivum*) — Rabi cereal
3. **Jowar (Sorghum)** (*Sorghum bicolor*) — Drought-hardy dryland millet
4. **Cotton (Seed Cotton / Kapas)** (*Gossypium hirsutum*) — Commercial fiber
5. **Maize** (*Zea mays*) — High-response cereal
6. **Sugarcane** (*Saccharum officinarum*) — High-biomass annual cash crop
7. **Soybean** (*Glycine max*) — Nitrogen-fixing legume oilseed
8. **Groundnut (Peanut)** (*Arachis hypogaea*) — Underground pegging oilseed legume

---

## 📐 Mathematical Formulation

### 1. Multiplicative Yield Model
$$\text{Estimated Yield } (Y) = (Y_{\text{base}} \times M_{\text{regional}}) \times f_{\text{soil}} \times f_{\text{water}} \times f_{\text{weather}} \times f_{\text{planting}} \times f_{\text{input}}$$

### 2. FAO-33 Water Production Function
$$\text{Water Ratio } (W_r) = \frac{\text{Water Available (mm)}}{\text{Crop Water Requirement (mm)}}$$

- **Deficit ($W_r \le 1.0$):**  
  $$f_{\text{water}} = \max\left(0.15, \, 1.0 - K_y \times (1.0 - W_r)\right)$$
- **Surplus / Waterlogging ($W_r > 1.0$):**
  - Rice: $f_{\text{water}} = 1.00$ up to $130\%$ (semi-aquatic flood tolerant).
  - Upland Crops: $f_{\text{water}} = \max\left(0.50, \, 1.0 - 0.50 \times (W_r - 1.0)\right)$ (aeration stress).

### 3. Exact Sequential Factor Attribution
$$\text{Sum of Factor Deltas } \sum_{i=1}^5 \Delta Y_i \equiv Y_{\text{final}} - Y_{\text{base}}$$
Guarantees 100% mathematical reconciliation on waterfall charts with zero residual error.

### 4. Strict Risk Engine
$$\text{Risk Score} = 0.35 R_{\text{water}} + 0.30 R_{\text{weather}} + 0.15 R_{\text{planting}} + 0.10 R_{\text{soil}} + 0.10 R_{\text{input}}$$
- **Low Risk**: $\text{Score} \le 30.0$
- **Medium Risk**: $30.0 < \text{Score} \le 65.0$
- **High Risk**: $\text{Score} > 65.0$

---

## 🚀 Quickstart & Usage

### 1. Run Unit Tests
```bash
python test_simulation.py
```
*(Runs 11 automated test suites validating all crops, weather states, water extremes, risk boundaries, and attribution reconciliations in ~0.004 seconds).*

### 2. Basic Python Simulation Example

```python
from simulation_engine import SimulationEngine

engine = SimulationEngine()

# Simulate a single scenario
result = engine.simulate({
    "scenario_name": "My Wheat Farm",
    "crop": "wheat",
    "state": "punjab",
    "soil": "alluvial_loam",
    "farm_size_ha": 2.0,
    "water_availability": 75,       # 75% of requirement (moderate deficit)
    "weather": "normal",
    "planting_date": "late",        # 15-30 days delayed
    "fertilizer": "recommended"     # 100% balanced NPK
})

print(f"Estimated Yield : {result['yield']['estimated_yield_t_ha']} t/ha")
print(f"Total Farm Cost : ₹{result['costs_and_returns']['total_cost_inr']:,.2f}")
print(f"Net Profit      : ₹{result['costs_and_returns']['net_profit_inr']:,.2f}")
print(f"Risk Assessment : {result['risk']['category']} ({result['risk']['score']}/100)")
print(f"Top Risk Driver : {result['risk']['primary_contributing_factor']}")
```

### 3. Scenario A vs Scenario B What-If Comparison

```python
scenario_a = {
    "scenario_name": "Scenario A (Adequate Water, Optimal Sowing)",
    "crop": "wheat",
    "state": "punjab",
    "water_availability": 100,      # 100% of requirement
    "planting_date": "optimal"
}

scenario_b = {
    "scenario_name": "Scenario B (25% Water Deficit, Late Sowing)",
    "crop": "wheat",
    "state": "punjab",
    "water_availability": 75,       # 75% of requirement
    "planting_date": "late"
}

comparison = engine.compare_scenarios(scenario_a, scenario_b)
print(comparison["comparison_summary"]["plain_english_explanation"])
```

---

## 🔬 Data Sources & Transparency

| Parameter | Type | Authoritative Source |
| :--- | :--- | :--- |
| **FAO $K_y$ Yield Response** | Source-Backed | FAO Irrigation and Drainage Paper No. 33 (Rome) |
| **Crop Water Requirements** | Source-Backed | Central Water Commission (CWC) & ICAR Agronomy Guidelines |
| **Recommended N-P-K Doses** | Source-Backed | ICAR State Agricultural University Packages of Practices |
| **Operational Base Costs** | Source-Backed | CACP Comprehensive Scheme Cost of Cultivation (Cost A2+FL) |
| **MSP & FRP Prices** | Source-Backed | CCEA Gazetted Prices for 2024–25 & 2025–26 |
| **Soil Suitability** | Source-Backed | ICAR-NBSS&LUP Soil Taxonomy & Land Capability Ratings |
| **Rainfall / Irrigation Split**| Prototype Assumption | State-level default rainfall share ($S_{\text{rain}}$) to avoid charging pumping energy for monsoon rain |
| **Weather Shock Multipliers** | Prototype Assumption | Calibrated seasonal multipliers from IMD/ICAR agro-meteorological advisories |
