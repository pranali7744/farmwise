"""
FarmWise Simulation Engine
Agri PS01: Scenario & Decision Simulator
DSSA PRARAMBHA 2.0 Hackathon

A transparent, deterministic, rule-based agricultural simulation engine.
Models crop yield, water application, farm costs, multi-dimensional risk,
and explainable factor attributions.
"""

import json
import math
import os
from typing import Any, Dict, List, Optional, Tuple, Union


class SimulationEngine:
    """
    Core deterministic simulation engine for FarmWise.
    
    Architecture:
      1. Baseline Crop Profile (ICAR / DES / CACP)
      2. Multiplicative Stress-Index (Soil, Water, Weather, Planting, Fertilizer)
      3. Resource & Water Allocation (Rainfall vs. Irrigation accounting)
      4. Dynamic Farm Cost & Economic Return Engine
      5. Strict Multi-Factor Risk Scorer (Low <= 30, Medium 30.1-65, High > 65)
      6. Exact Chain-Linked Sequential Factor Attribution
      7. Scenario A vs Scenario B Log-Ratio Comparison (Vartia Decomposition)
    """

    def __init__(self, data_dir: Optional[str] = None):
        """Initialize engine and load agronomic parameter datasets."""
        if data_dir is None:
            base_path = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(base_path, "data")
        
        self.data_dir = data_dir
        self.crops_data = self._load_json("crops.json").get("crops", {})
        self.soils_data = self._load_json("soils.json").get("soils", {})
        self.weather_data = self._load_json("weather_profiles.json").get("weather_profiles", {})
        self.regions_data = self._load_json("regional_profiles.json").get("states", {})

        # Planting schedule discrete modifiers and risk ratings (ICAR agronomy guidelines)
        # Sowing timeliness directly impacts thermal windows and vegetative duration
        self.planting_profiles = {
            "optimal": {
                "id": "optimal",
                "name": "Optimal Window (Recommended)",
                "modifier": 1.00,
                "risk_score": 5.0,
                "description": "Sowing aligns perfectly with recommended agro-climatic calendar"
            },
            "early": {
                "id": "early",
                "name": "Early Sowing (10-15 days early)",
                "modifier": 0.95,
                "risk_score": 25.0,
                "description": "Risk of false monsoon start or early-stage seedling pest infestation"
            },
            "late": {
                "id": "late",
                "name": "Late Sowing (15-30 days delayed)",
                "modifier": 0.86,
                "risk_score": 50.0,
                "description": "Shortened vegetative phase and risk of terminal heat stress during grain filling"
            },
            "very_late": {
                "id": "very_late",
                "name": "Very Late Sowing (>30 days delayed)",
                "modifier": 0.72,
                "risk_score": 85.0,
                "description": "Severe yield penalty from forced maturity and high reproductive heat stress"
            }
        }

        # Fertilizer input application ratios relative to ICAR recommended dosage
        self.fertilizer_cost_factors = {
            "low": 0.50,
            "moderate": 0.75,
            "recommended": 1.00,
            "high": 1.30,
            "excessive": 1.60,
            "organic": 0.80
        }

    def _load_json(self, filename: str) -> dict:
        """Helper to load JSON file safely with clear error messaging."""
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"FarmWise data file not found: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    # -------------------------------------------------------------------------
    # NORMALIZATION & ROBUST INPUT VALIDATION
    # -------------------------------------------------------------------------
    def normalize_crop(self, crop: Any) -> str:
        """Normalizes and validates crop input."""
        if not crop or not isinstance(crop, str):
            raise ValueError(f"Crop must be a non-empty string. Supported: {list(self.crops_data.keys())}")
        c = crop.lower().strip()
        alias_map = {
            "paddy": "rice",
            "rice (paddy)": "rice",
            "sorghum": "jowar",
            "jowar (sorghum)": "jowar",
            "kapas": "cotton",
            "seed cotton": "cotton",
            "cotton (seed cotton)": "cotton",
            "cotton (seed cotton / kapas)": "cotton",
            "corn": "maize",
            "cane": "sugarcane",
            "soya": "soybean",
            "peanut": "groundnut",
            "groundnut (pod)": "groundnut"
        }
        c = alias_map.get(c, c)
        if c not in self.crops_data:
            valid_crops = list(self.crops_data.keys())
            raise ValueError(f"Invalid crop '{crop}'. Supported crops: {valid_crops}")
        return c

    def normalize_soil(self, soil: Any) -> str:
        """Normalizes and validates soil input."""
        if not soil or not isinstance(soil, str):
            raise ValueError(f"Soil must be a non-empty string. Supported: {list(self.soils_data.keys())}")
        s = soil.lower().strip().replace("-", "_").replace(" ", "_")
        alias_map = {
            "alluvial": "alluvial_loam",
            "alluvial_soil": "alluvial_loam",
            "alluvial_loam": "alluvial_loam",
            "loam": "alluvial_loam",
            "black": "black_soil",
            "black_soil": "black_soil",
            "vertisol": "black_soil",
            "black_cotton": "black_soil",
            "black_cotton_soil": "black_soil",
            "red": "red_sandy_loam",
            "red_soil": "red_sandy_loam",
            "red_sandy": "red_sandy_loam",
            "red_sandy_loam": "red_sandy_loam",
            "alfisol": "red_sandy_loam",
            "clay": "clay_loam",
            "clay_loam": "clay_loam",
            "clayey": "clay_loam",
            "sandy": "sandy_soil",
            "sandy_soil": "sandy_soil",
            "sand": "sandy_soil"
        }
        s = alias_map.get(s, s)
        if s not in self.soils_data:
            valid_soils = list(self.soils_data.keys())
            raise ValueError(f"Invalid soil '{soil}'. Supported soils: {valid_soils}")
        return s

    def normalize_weather(self, weather: Any) -> str:
        """Normalizes and validates weather input."""
        if not weather or not isinstance(weather, str):
            raise ValueError(f"Weather must be a non-empty string. Supported: {list(self.weather_data.keys())}")
        w = weather.lower().strip().replace("-", "_").replace(" ", "_")
        alias_map = {
            "optimal": "optimal",
            "opt": "optimal",
            "favorable": "optimal",
            "highly_favorable": "optimal",
            "normal": "normal",
            "norm": "normal",
            "seasonal": "normal",
            "average": "normal",
            "seasonal_average": "normal",
            "moderate_heatwave": "moderate_heatwave",
            "heatwave": "moderate_heatwave",
            "moderate_heat": "moderate_heatwave",
            "dry_spell": "moderate_heatwave",
            "severe_drought": "severe_drought",
            "drought": "severe_drought",
            "severe": "severe_drought",
            "extreme_drought": "severe_drought",
            "unseasonal_rain": "unseasonal_rain",
            "rain": "unseasonal_rain",
            "heavy_rain": "unseasonal_rain",
            "excessive_rain": "unseasonal_rain",
            "unseasonal": "unseasonal_rain",
            "hail": "unseasonal_rain"
        }
        w = alias_map.get(w, w)
        if w not in self.weather_data:
            valid_weathers = list(self.weather_data.keys())
            raise ValueError(f"Invalid weather condition '{weather}'. Supported: {valid_weathers}")
        return w

    def normalize_planting_window(self, window: Any) -> str:
        """
        Normalizes and validates planting window input once:
          late_sowing -> late
          late_15_30 -> late
          very_late_gt_30 -> very_late
          delayed -> very_late
        """
        if not window or not isinstance(window, str):
            raise ValueError(f"Planting window must be a non-empty string. Supported: {list(self.planting_profiles.keys())}")
        p = window.lower().strip().replace("-", "_").replace(" ", "_")
        alias_map = {
            "optimal": "optimal",
            "recommended": "optimal",
            "recommended_window": "optimal",
            "optimal_window": "optimal",
            "normal": "optimal",
            "on_time": "optimal",
            "early": "early",
            "early_sowing": "early",
            "early_planting": "early",
            "late": "late",
            "late_sowing": "late",
            "late_15_30": "late",
            "delayed_15_30": "late",
            "late_planting": "late",
            "very_late": "very_late",
            "very_late_sowing": "very_late",
            "very_late_gt_30": "very_late",
            "delayed": "very_late",
            "severely_delayed": "very_late"
        }
        p = alias_map.get(p, p)
        if p not in self.planting_profiles:
            valid_windows = list(self.planting_profiles.keys())
            raise ValueError(f"Invalid planting window '{window}'. Supported options: {valid_windows}")
        return p

    def normalize_fertilizer_level(self, level: Any) -> str:
        """
        Normalizes and validates fertilizer input level:
          organic_bio -> organic
          "organic / bio" -> organic
          balanced -> recommended
        """
        if not level or not isinstance(level, str):
            raise ValueError("Fertilizer level must be a non-empty string.")
        f = level.lower().strip()
        f = f.replace(" / ", "_").replace("/", "_").replace("-", "_").replace(" ", "_")
        alias_map = {
            "organic": "organic",
            "organic_bio": "organic",
            "organic_biocides": "organic",
            "bio": "organic",
            "bio_fertilizer": "organic",
            "organic_fertilizer": "organic",
            "recommended": "recommended",
            "balanced": "recommended",
            "optimal": "recommended",
            "standard": "recommended",
            "normal": "recommended",
            "100%": "recommended",
            "100_pct": "recommended",
            "low": "low",
            "deficient": "low",
            "sub_optimal": "low",
            "50%": "low",
            "50_pct": "low",
            "moderate": "moderate",
            "medium": "moderate",
            "75%": "moderate",
            "75_pct": "moderate",
            "high": "high",
            "intensive": "high",
            "130%": "high",
            "130_pct": "high",
            "excessive": "excessive",
            "over_fertilized": "excessive",
            "overfertilization": "excessive",
            "160%": "excessive",
            "160_pct": "excessive"
        }
        f = alias_map.get(f, f)
        valid_fert = ["low", "moderate", "recommended", "high", "excessive", "organic"]
        if f not in valid_fert:
            raise ValueError(f"Invalid fertilizer level '{level}'. Supported options: {valid_fert}")
        return f

    def normalize_water_availability(self, water: Any) -> Tuple[float, float]:
        """
        Normalizes and validates water availability input:
          0   = 0% of requirement
          50  = 50% of requirement
          75  = 75% of requirement
          100 = 100% of requirement
          125 = 125% of requirement
          150 = 150% of requirement
        
        Returns:
          (water_pct, water_ratio) where water_pct is in [0.0, 250.0] and water_ratio = water_pct / 100.0.
        """
        if water is None:
            return 100.0, 1.00

        if isinstance(water, str):
            w_str = water.lower().strip().replace("-", "_").replace(" ", "_")
            alias_map = {
                "severe_deficit": 50.0,
                "deficit": 50.0,
                "moderate_deficit": 75.0,
                "adequate": 100.0,
                "optimal": 100.0,
                "normal": 100.0,
                "slight_surplus": 115.0,
                "surplus": 115.0,
                "excessive": 140.0,
                "flood": 140.0,
                "waterlogging": 140.0,
                "surplus_excessive": 140.0,
                "surplus/excessive": 140.0,
                "100%": 100.0,
                "100_pct": 100.0,
                "75%": 75.0,
                "75_pct": 75.0,
                "50%": 50.0,
                "50_pct": 50.0,
                "0%": 0.0,
                "0_pct": 0.0,
                "125%": 125.0,
                "125_pct": 125.0,
                "150%": 150.0,
                "150_pct": 150.0
            }
            if w_str in alias_map:
                val = alias_map[w_str]
            elif w_str.endswith("%"):
                try:
                    val = float(w_str[:-1].strip())
                except ValueError:
                    raise ValueError(f"Invalid water availability '{water}'. Must be a number or valid string.")
            elif w_str.endswith("_pct"):
                try:
                    val = float(w_str[:-4].strip())
                except ValueError:
                    raise ValueError(f"Invalid water availability '{water}'. Must be a number or valid string.")
            else:
                try:
                    val = float(w_str)
                except ValueError:
                    raise ValueError(
                        f"Invalid water availability '{water}'. Supported options: "
                        f"severe_deficit, moderate_deficit, adequate, surplus, excessive, or a percentage (e.g. 0, 50, 75, 100, 125, 150)."
                    )
        elif isinstance(water, (int, float)):
            val = float(water)
        else:
            raise ValueError(f"Invalid water availability '{water}'. Must be a number or valid string.")

        if val < 0.0:
            raise ValueError(f"Water availability cannot be negative. Received: {val}")

        # Backward compatibility for legacy decimal ratios:
        # If a positive decimal fraction <= 2.5 was provided (e.g. 0.75 for 75%, 1.0 for 100%),
        # map it to percentage (val * 100.0). Note: 0 remains 0% of requirement.
        if 0.0 < val <= 2.5:
            val = val * 100.0

        # Clamp to realistic bounds [0.0%, 250.0%]
        water_pct = max(0.0, min(250.0, val))
        water_ratio = round(water_pct / 100.0, 4)

        return water_pct, water_ratio

    # -------------------------------------------------------------------------
    # 1. YIELD CALCULATION (Deterministic Multiplicative Engine)
    # -------------------------------------------------------------------------
    def calculate_yield(
        self,
        crop_id: str,
        soil_id: str,
        water_ratio: float,
        weather_id: str,
        planting_window: str,
        fertilizer_level: str,
        regional_yield_mult: float = 1.0
    ) -> Tuple[float, float, float, float, float, float, float, float]:
        """
        Calculates crop yield using the deterministic multiplicative formula:
          Yield = (Base_Yield * Regional_Mult) * f_soil * f_water * f_weather * f_planting * f_input

        Returns:
          (final_yield, f_soil, f_water, f_weather, f_planting, f_input, base_yield, adjusted_base_yield)
        """
        # Canonical normalization & validation
        crop_id = self.normalize_crop(crop_id)
        soil_id = self.normalize_soil(soil_id)
        weather_id = self.normalize_weather(weather_id)
        planting_window = self.normalize_planting_window(planting_window)
        fertilizer_level = self.normalize_fertilizer_level(fertilizer_level)

        crop_info = self.crops_data[crop_id]
        base_yield = float(crop_info["base_yield_t_ha"])
        adjusted_base_yield = round(base_yield * regional_yield_mult, 4)

        # A. Soil Factor (f_soil)
        f_soil = float(self.soils_data[soil_id]["crop_modifiers"].get(crop_id, 1.0))

        # B. Water Factor (f_water) - FAO-33 Formulation
        fao_ky = float(crop_info["fao_ky"])
        is_semi_aquatic = bool(crop_info.get("is_semi_aquatic", False))

        if water_ratio <= 1.0:
            # Deficit condition: Linear FAO-33 water production function
            f_water = max(0.15, 1.0 - fao_ky * (1.0 - water_ratio))
        else:
            # Surplus condition
            if is_semi_aquatic:
                # Rice tolerates standing water / flood up to 130%
                f_water = 1.00 if water_ratio <= 1.30 else max(0.85, 1.0 - 0.25 * (water_ratio - 1.30))
            else:
                # Upland crops suffer from aeration stress / root hypoxia
                f_water = max(0.50, 1.0 - 0.50 * (water_ratio - 1.0))
        f_water = round(f_water, 4)

        # C. Weather Factor (f_weather)
        f_weather = float(self.weather_data[weather_id]["modifier"])

        # D. Planting Schedule Factor (f_planting)
        f_planting = float(self.planting_profiles[planting_window]["modifier"])

        # E. Fertilizer / Input Factor (f_input) - Crop-Specific Discrete Matrix
        crop_fert_map = crop_info["fertilizer_modifiers"]
        f_input = float(crop_fert_map[fertilizer_level])

        # Final Multiplicative Yield
        final_yield = adjusted_base_yield * f_soil * f_water * f_weather * f_planting * f_input
        final_yield = max(0.05, round(final_yield, 4))

        return final_yield, f_soil, f_water, f_weather, f_planting, f_input, base_yield, adjusted_base_yield

    # -------------------------------------------------------------------------
    # 2. WATER & RESOURCE CALCULATION (Rainfall vs Irrigation Partitioning)
    # -------------------------------------------------------------------------
    def calculate_water(
        self,
        crop_id: str,
        water_ratio: float,
        farm_size_ha: float,
        rainfall_share: float = 0.40
    ) -> Dict[str, Any]:
        """
        Calculates seasonal water applied/allocated, distinguishing rainfall from pumped irrigation.
        
        Conversion: 1 mm depth on 1 hectare = 10 cubic meters (m³) = 10,000 liters.
        """
        crop_id = self.normalize_crop(crop_id)
        crop_info = self.crops_data[crop_id]
        crop_req_mm = float(crop_info["water_req_mm"])

        # Total seasonal water depth applied/received
        total_depth_mm = round(crop_req_mm * water_ratio, 2)
        total_volume_m3 = round(total_depth_mm * 10.0 * farm_size_ha, 2)

        # Partition into natural rainfall and pumped irrigation
        rainfall_share = max(0.0, min(1.0, rainfall_share))
        rainfall_depth_mm = round(min(total_depth_mm, crop_req_mm * rainfall_share), 2)
        irrigation_depth_mm = round(max(0.0, total_depth_mm - rainfall_depth_mm), 2)

        rainfall_volume_m3 = round(rainfall_depth_mm * 10.0 * farm_size_ha, 2)
        irrigation_volume_m3 = round(irrigation_depth_mm * 10.0 * farm_size_ha, 2)
        total_volume_m3 = round(rainfall_volume_m3 + irrigation_volume_m3, 2)

        return {
            "crop_requirement_mm": crop_req_mm,
            "water_applied_depth_mm": total_depth_mm,
            "total_water_applied_m3": total_volume_m3,
            "rainfall_depth_mm": rainfall_depth_mm,
            "rainfall_volume_m3": rainfall_volume_m3,
            "irrigation_depth_mm": irrigation_depth_mm,
            "irrigation_volume_m3": irrigation_volume_m3,
            "rainfall_contribution_pct": round((rainfall_volume_m3 / total_volume_m3 * 100.0) if total_volume_m3 > 0 else 0.0, 1),
            "irrigation_contribution_pct": round((irrigation_volume_m3 / total_volume_m3 * 100.0) if total_volume_m3 > 0 else 0.0, 1)
        }

    # -------------------------------------------------------------------------
    # 3. COST & ECONOMIC OUTCOME CALCULATION (CACP A2+FL Operational Framework)
    # -------------------------------------------------------------------------
    def calculate_cost(
        self,
        crop_id: str,
        farm_size_ha: float,
        fertilizer_level: str,
        irrigation_volume_m3: float,
        total_water_m3: float,
        yield_t_ha: float
    ) -> Dict[str, Any]:
        """
        Calculates operational farm cost and projected economics based on CACP A2+FL baseline.
        
        Pumping cost only applies to the pumped irrigation portion, not natural rainfall.
        """
        crop_id = self.normalize_crop(crop_id)
        fertilizer_level = self.normalize_fertilizer_level(fertilizer_level)

        crop_info = self.crops_data[crop_id]
        base_cost_ha = float(crop_info["base_cost_ha"])
        ratios = crop_info["cost_breakdown_ratio"]

        # Component baselines
        seed_cost_ha = base_cost_ha * ratios.get("seed", 0.18)
        base_fert_cost_ha = base_cost_ha * ratios.get("fert", 0.28)
        base_irrigation_cost_ha = base_cost_ha * ratios.get("irrigation_pump", 0.22)
        labor_cost_ha = base_cost_ha * ratios.get("labor_machinery", 0.32)

        # Dynamic adjustment for fertilizer level
        fert_scale = self.fertilizer_cost_factors.get(fertilizer_level, 1.0)
        fert_cost_ha = base_fert_cost_ha * fert_scale

        # Dynamic adjustment for irrigation: only pumped irrigation incurs fuel/electricity charges
        irrigation_ratio = (irrigation_volume_m3 / total_water_m3) if total_water_m3 > 0 else 0.0
        irrigation_cost_ha = base_irrigation_cost_ha * irrigation_ratio

        # Total operational cost per hectare and total farm cost
        total_cost_ha = round(seed_cost_ha + fert_cost_ha + irrigation_cost_ha + labor_cost_ha, 2)
        total_farm_cost = round(total_cost_ha * farm_size_ha, 2)

        # Total harvest and revenue
        msp_per_qtl = float(crop_info["msp_price_qtl"])
        total_production_tonnes = round(yield_t_ha * farm_size_ha, 4)
        total_production_quintals = round(total_production_tonnes * 10.0, 2)  # 1 tonne = 10 quintals
        
        gross_revenue = round(total_production_quintals * msp_per_qtl, 2)
        net_profit = round(gross_revenue - total_farm_cost, 2)
        bcr = round(gross_revenue / total_farm_cost, 2) if total_farm_cost > 0 else 0.0

        return {
            "cost_per_ha_inr": total_cost_ha,
            "total_farm_cost_inr": total_farm_cost,
            "cost_breakdown_per_ha": {
                "seed_cost": round(seed_cost_ha, 2),
                "fertilizer_cost": round(fert_cost_ha, 2),
                "irrigation_pumping_cost": round(irrigation_cost_ha, 2),
                "labor_machinery_cost": round(labor_cost_ha, 2)
            },
            "benchmark_price_per_qtl": msp_per_qtl,
            "total_production_tonnes": total_production_tonnes,
            "total_production_quintals": total_production_quintals,
            "gross_revenue_inr": gross_revenue,
            "net_profit_inr": net_profit,
            "benefit_cost_ratio": bcr
        }

    # -------------------------------------------------------------------------
    # 4. STRICT MULTI-FACTOR RISK ENGINE (Strict Thresholds: Low <= 30)
    # -------------------------------------------------------------------------
    def calculate_risk(
        self,
        crop_id: str,
        soil_factor: float,
        water_ratio: float,
        weather_id: str,
        planting_window: str,
        fertilizer_level: str
    ) -> Dict[str, Any]:
        """
        Computes composite farm risk score (0-100) and strictly classifies into:
          Low    <= 30.0
          Medium > 30.0 and <= 65.0
          High   > 65.0
        """
        crop_id = self.normalize_crop(crop_id)
        weather_id = self.normalize_weather(weather_id)
        planting_window = self.normalize_planting_window(planting_window)
        fertilizer_level = self.normalize_fertilizer_level(fertilizer_level)

        crop_info = self.crops_data[crop_id]
        fao_ky = float(crop_info["fao_ky"])
        is_semi_aquatic = bool(crop_info.get("is_semi_aquatic", False))

        # 1. Water Sub-Risk
        if water_ratio <= 1.0:
            # Deficit risk scaled by crop drought sensitivity (Ky)
            r_water = min(100.0, (1.0 - water_ratio) * 160.0 * fao_ky)
        else:
            if is_semi_aquatic:
                r_water = 0.0 if water_ratio <= 1.30 else min(100.0, (water_ratio - 1.30) * 100.0)
            else:
                # Waterlogging risk for upland crops
                r_water = 0.0 if water_ratio <= 1.15 else min(100.0, (water_ratio - 1.15) * 150.0)

        # 2. Weather Sub-Risk
        r_weather = float(self.weather_data[weather_id]["risk_score"])

        # 3. Planting Timeliness Sub-Risk
        r_planting = float(self.planting_profiles[planting_window]["risk_score"])

        # 4. Soil Incompatibility Sub-Risk
        r_soil = max(0.0, min(100.0, (1.0 - soil_factor) * 250.0))

        # 5. Fertilizer/Nutrient Sub-Risk
        input_risk_table = {
            "low": 45.0,        # Nutrient starvation risk
            "moderate": 20.0,
            "recommended": 5.0, # Balanced, optimal health
            "high": 15.0,
            "excessive": 60.0,   # Lodging, toxicity, disease susceptibility
            "organic": 15.0
        }
        r_input = input_risk_table.get(fertilizer_level, 20.0)

        # Weighted Composite Risk Score
        w_water, w_weather, w_planting, w_soil, w_input = 0.35, 0.30, 0.15, 0.10, 0.10
        composite_score = (
            w_water * r_water +
            w_weather * r_weather +
            w_planting * r_planting +
            w_soil * r_soil +
            w_input * r_input
        )
        composite_score = round(max(0.0, min(100.0, composite_score)), 2)

        # Strict Threshold Classification:
        # Low <= 30.0, Medium > 30.0 and <= 65.0, High > 65.0
        if composite_score <= 30.0:
            category = "Low"
        elif composite_score <= 65.0:
            category = "Medium"
        else:
            category = "High"

        # Identify top contributing hazard factors
        contributions = [
            ("Water Stress", round(w_water * r_water, 2), r_water),
            ("Weather Anomaly", round(w_weather * r_weather, 2), r_weather),
            ("Planting Schedule", round(w_planting * r_planting, 2), r_planting),
            ("Soil Incompatibility", round(w_soil * r_soil, 2), r_soil),
            ("Nutrient Balance", round(w_input * r_input, 2), r_input)
        ]
        # Sort by weighted point contribution descending
        contributions.sort(key=lambda x: x[1], reverse=True)

        primary_risk = f"{contributions[0][0]} (+{contributions[0][1]} pts)"
        secondary_risk = f"{contributions[1][0]} (+{contributions[1][1]} pts)" if contributions[1][1] > 2.0 else "None"

        return {
            "score": composite_score,
            "category": category,
            "primary_contributing_factor": primary_risk,
            "secondary_contributing_factor": secondary_risk,
            "sub_risks": {
                "water_risk": round(r_water, 2),
                "weather_risk": round(r_weather, 2),
                "planting_risk": round(r_planting, 2),
                "soil_risk": round(r_soil, 2),
                "input_risk": round(r_input, 2)
            }
        }

    # -------------------------------------------------------------------------
    # 5. CHAIN-LINKED SEQUENTIAL FACTOR ATTRIBUTION (Exact Reconciliation)
    # -------------------------------------------------------------------------
    def calculate_factor_impact(
        self,
        base_yield: float,
        f_soil: float,
        f_water: float,
        f_weather: float,
        f_planting: float,
        f_input: float,
        final_yield: float
    ) -> List[Dict[str, Any]]:
        """
        Computes sequential factor attribution along the chronological biological flow:
          Y0 = Base Yield
          Y1 = Y0 * f_soil       -> Delta_Soil     = Y1 - Y0
          Y2 = Y1 * f_water      -> Delta_Water    = Y2 - Y1
          Y3 = Y2 * f_weather    -> Delta_Weather  = Y3 - Y2
          Y4 = Y3 * f_planting   -> Delta_Planting = Y4 - Y3
          Y5 = Y4 * f_input      -> Delta_Input    = Y5 - Y4
        
        Mathematical Proof of Exact Reconciliation:
          Sum(Delta_i) = (Y1 - Y0) + (Y2 - Y1) + (Y3 - Y2) + (Y4 - Y3) + (Y5 - Y4)
                       = Y5 - Y0 == Final Yield - Base Yield.
        """
        factors_seq = [
            ("Soil Compatibility", "soil", f_soil),
            ("Water Availability", "water", f_water),
            ("Weather Condition", "weather", f_weather),
            ("Planting Schedule", "planting", f_planting),
            ("Fertilizer / Inputs", "fertilizer", f_input)
        ]

        waterfall = []
        running_yield = base_yield

        for label, key, mod in factors_seq:
            next_yield = running_yield * mod
            delta_t_ha = round(next_yield - running_yield, 6)
            delta_pct = round((mod - 1.0) * 100.0, 2)

            waterfall.append({
                "factor_name": label,
                "factor_key": key,
                "modifier": round(mod, 4),
                "impact_t_ha": round(delta_t_ha, 4),
                "percentage_change": delta_pct,
                "yield_after_factor": round(next_yield, 4)
            })
            running_yield = next_yield

        return waterfall

    # -------------------------------------------------------------------------
    # 6. COMPLETE SIMULATE METHOD
    # -------------------------------------------------------------------------
    def simulate(self, scenario_inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulates a complete agricultural scenario and returns a structured JSON-compatible dictionary.
        
        Required inputs:
          - crop: str (e.g. 'wheat', 'rice')
        
        Optional inputs:
          - scenario_name: str (default: 'Scenario')
          - state / region: str (default: 'punjab')
          - soil: str (defaults to state's native soil)
          - farm_size_ha: float (default: 1.0)
          - farm_size_acres: float (converted if ha not provided)
          - water_availability: float (e.g. 100 for 100%, 75 for 75%) or str ('moderate_deficit', 'adequate', etc.)
          - weather: str (default: 'normal')
          - planting_date: str (default: 'optimal')
          - fertilizer: str (default: 'recommended')
        """
        scenario_name = scenario_inputs.get("scenario_name", "Scenario")

        # 1. Resolve & Normalize Crop
        crop_id = self.normalize_crop(scenario_inputs.get("crop", "wheat"))

        # 2. Resolve State / Region
        state_id = str(scenario_inputs.get("state", scenario_inputs.get("region", "punjab"))).lower().strip()
        state_info = self.regions_data.get(state_id, None)
        
        if state_info is not None:
            state_name = state_info["name"]
            default_soil = state_info["default_soil"]
            rainfall_share = float(state_info.get("default_rainfall_share", 0.40))
            regional_mult = float(state_info.get("state_crop_yield_mult", {}).get(crop_id, 1.0))
        else:
            state_name = state_id.title()
            default_soil = "alluvial_loam"
            rainfall_share = 0.40
            regional_mult = 1.0

        # 3. Resolve & Normalize Soil
        soil_input = scenario_inputs.get("soil", default_soil)
        soil_id = self.normalize_soil(soil_input)

        # 4. Resolve Farm Size
        if "farm_size_ha" in scenario_inputs:
            farm_size_ha = float(scenario_inputs["farm_size_ha"])
        elif "farm_size_acres" in scenario_inputs:
            farm_size_ha = float(scenario_inputs["farm_size_acres"]) / 2.47105
        elif "farm_size" in scenario_inputs:
            farm_size_ha = float(scenario_inputs["farm_size"])
        else:
            farm_size_ha = 1.0

        if farm_size_ha <= 0:
            raise ValueError(f"Farm size must be greater than 0. Received: {farm_size_ha}")

        # 5. Resolve Water Availability & Ratio
        if "water_ratio" in scenario_inputs and "water_availability" not in scenario_inputs:
            raw_ratio = scenario_inputs["water_ratio"]
            try:
                r_val = float(raw_ratio)
            except (ValueError, TypeError):
                raise ValueError(f"Invalid water ratio '{raw_ratio}'. Must be a valid number.")
            if r_val < 0.0:
                raise ValueError(f"Water ratio cannot be negative. Received: {r_val}")
            water_pct, water_ratio = self.normalize_water_availability(r_val * 100.0)
        else:
            water_input = scenario_inputs.get("water_availability", 100.0)
            water_pct, water_ratio = self.normalize_water_availability(water_input)

        # 6. Resolve Weather, Planting Window, and Fertilizer Level (Normalized once up-front)
        weather_input = scenario_inputs.get("weather", "normal")
        weather_id = self.normalize_weather(weather_input)

        planting_input = scenario_inputs.get("planting_date", scenario_inputs.get("planting_schedule", "optimal"))
        planting_window = self.normalize_planting_window(planting_input)

        fertilizer_input = scenario_inputs.get("fertilizer", scenario_inputs.get("input_usage", "recommended"))
        fertilizer_level = self.normalize_fertilizer_level(fertilizer_input)

        # --- RUN ENGINE PIPELINE ---
        
        # A. Yield
        (final_yield, f_soil, f_water, f_weather, f_planting, f_input,
         base_yield, adjusted_base_yield) = self.calculate_yield(
            crop_id=crop_id,
            soil_id=soil_id,
            water_ratio=water_ratio,
            weather_id=weather_id,
            planting_window=planting_window,
            fertilizer_level=fertilizer_level,
            regional_yield_mult=regional_mult
        )

        # B. Water & Resources
        water_results = self.calculate_water(
            crop_id=crop_id,
            water_ratio=water_ratio,
            farm_size_ha=farm_size_ha,
            rainfall_share=rainfall_share
        )

        # C. Cost & Economic Returns
        cost_results = self.calculate_cost(
            crop_id=crop_id,
            farm_size_ha=farm_size_ha,
            fertilizer_level=fertilizer_level,
            irrigation_volume_m3=water_results["irrigation_volume_m3"],
            total_water_m3=water_results["total_water_applied_m3"],
            yield_t_ha=final_yield
        )

        # Water productivity (kg produced per m³ of total water applied)
        total_m3 = water_results["total_water_applied_m3"]
        water_productivity = round((cost_results["total_production_tonnes"] * 1000.0) / total_m3, 3) if total_m3 > 0 else 0.0

        # D. Risk
        risk_results = self.calculate_risk(
            crop_id=crop_id,
            soil_factor=f_soil,
            water_ratio=water_ratio,
            weather_id=weather_id,
            planting_window=planting_window,
            fertilizer_level=fertilizer_level
        )

        # E. Exact Sequential Factor Attribution
        factor_attribution = self.calculate_factor_impact(
            base_yield=adjusted_base_yield,
            f_soil=f_soil,
            f_water=f_water,
            f_weather=f_weather,
            f_planting=f_planting,
            f_input=f_input,
            final_yield=final_yield
        )

        # Fertilizer NPK consumption
        rec_npk = self.crops_data[crop_id]["rec_npk_kg_ha"]
        fert_factor = self.fertilizer_cost_factors.get(fertilizer_level, 1.0)
        npk_applied = {
            "n_kg": round(rec_npk["n"] * fert_factor * farm_size_ha, 1),
            "p_kg": round(rec_npk["p"] * fert_factor * farm_size_ha, 1),
            "k_kg": round(rec_npk["k"] * fert_factor * farm_size_ha, 1)
        }

        return {
            "scenario_name": scenario_name,
            "inputs": {
                "state": state_name,
                "crop": self.crops_data[crop_id]["name"],
                "soil": self.soils_data[soil_id]["name"],
                "farm_size_ha": round(farm_size_ha, 2),
                "water_availability": f"{round(water_pct, 1):g}% of requirement",
                "weather": self.weather_data[weather_id]["name"],
                "planting_date": self.planting_profiles[planting_window]["name"],
                "fertilizer": fertilizer_level.title()
            },
            "parameters": {
                "crop_id": crop_id,
                "state_id": state_id,
                "soil_id": soil_id,
                "weather_id": weather_id,
                "planting_window": planting_window,
                "fertilizer_level": fertilizer_level,
                "water_availability_pct": round(water_pct, 1),
                "water_ratio": round(water_ratio, 4),
                "base_yield_t_ha": base_yield,
                "regional_adjusted_base_yield_t_ha": adjusted_base_yield,
                "modifiers": {
                    "soil": f_soil,
                    "water": f_water,
                    "weather": f_weather,
                    "planting": f_planting,
                    "fertilizer": f_input
                }
            },
            "yield": {
                "estimated_yield_t_ha": final_yield,
                "total_production_tonnes": cost_results["total_production_tonnes"],
                "total_production_quintals": cost_results["total_production_quintals"]
            },
            "water_applied_allocated": {
                "total_water_m3": water_results["total_water_applied_m3"],
                "water_depth_mm": water_results["water_applied_depth_mm"],
                "rainfall_contribution_m3": water_results["rainfall_volume_m3"],
                "irrigation_pumped_m3": water_results["irrigation_volume_m3"],
                "rainfall_share_pct": water_results["rainfall_contribution_pct"],
                "irrigation_share_pct": water_results["irrigation_contribution_pct"],
                "water_productivity_kg_m3": water_productivity
            },
            "costs_and_returns": {
                "total_cost_inr": cost_results["total_farm_cost_inr"],
                "cost_per_ha_inr": cost_results["cost_per_ha_inr"],
                "gross_revenue_inr": cost_results["gross_revenue_inr"],
                "net_profit_inr": cost_results["net_profit_inr"],
                "benefit_cost_ratio": cost_results["benefit_cost_ratio"],
                "msp_per_qtl": cost_results["benchmark_price_per_qtl"],
                "cost_breakdown": cost_results["cost_breakdown_per_ha"]
            },
            "fertilizer_consumption": {
                "npk_applied_total_kg": npk_applied
            },
            "risk": risk_results,
            "factor_attribution": factor_attribution,
            "reconciliation": {
                "base_yield": adjusted_base_yield,
                "final_yield": final_yield,
                "sum_of_factor_deltas": round(sum(item["impact_t_ha"] for item in factor_attribution), 4),
                "actual_net_change": round(final_yield - adjusted_base_yield, 4),
                "is_reconciled": abs(sum(item["impact_t_ha"] for item in factor_attribution) - (final_yield - adjusted_base_yield)) < 1e-4
            }
        }

    # -------------------------------------------------------------------------
    # 7. SCENARIO COMPARISON (Scenario A vs Scenario B with Log-Ratio Vartia Attribution)
    # -------------------------------------------------------------------------
    def compare_scenarios(
        self,
        scenario_a_inputs_or_result: Union[Dict[str, Any], Any],
        scenario_b_inputs_or_result: Union[Dict[str, Any], Any]
    ) -> Dict[str, Any]:
        """
        Compares two farming scenarios (Scenario A vs Scenario B).
        Computes metric deltas and allocates the yield delta across all changing factors
        using the mathematically exact Log-Ratio (Vartia) decomposition:
          Sum(Delta_Factor_i) == Yield_B - Yield_A.
        """
        # Accept either inputs dict or already simulated dicts
        res_a = scenario_a_inputs_or_result if "yield" in scenario_a_inputs_or_result else self.simulate(scenario_a_inputs_or_result)
        res_b = scenario_b_inputs_or_result if "yield" in scenario_b_inputs_or_result else self.simulate(scenario_b_inputs_or_result)

        y_a = res_a["yield"]["estimated_yield_t_ha"]
        y_b = res_b["yield"]["estimated_yield_t_ha"]
        delta_yield = round(y_b - y_a, 4)
        pct_delta_yield = round((delta_yield / y_a * 100.0) if y_a > 0 else 0.0, 2)

        cost_a = res_a["costs_and_returns"]["total_cost_inr"]
        cost_b = res_b["costs_and_returns"]["total_cost_inr"]
        delta_cost = round(cost_b - cost_a, 2)

        profit_a = res_a["costs_and_returns"]["net_profit_inr"]
        profit_b = res_b["costs_and_returns"]["net_profit_inr"]
        delta_profit = round(profit_b - profit_a, 2)

        water_a = res_a["water_applied_allocated"]["total_water_m3"]
        water_b = res_b["water_applied_allocated"]["total_water_m3"]
        delta_water = round(water_b - water_a, 2)

        risk_a = res_a["risk"]["score"]
        risk_b = res_b["risk"]["score"]
        delta_risk = round(risk_b - risk_a, 2)

        # Logarithmic Ratio Decomposition for inter-scenario attribution
        # Factors to compare: Baseline, Soil, Water, Weather, Planting, Fertilizer
        factors_to_compare = [
            ("Baseline Yield", "baseline", res_a["parameters"]["regional_adjusted_base_yield_t_ha"], res_b["parameters"]["regional_adjusted_base_yield_t_ha"]),
            ("Soil Compatibility", "soil", res_a["parameters"]["modifiers"]["soil"], res_b["parameters"]["modifiers"]["soil"]),
            ("Water Availability", "water", res_a["parameters"]["modifiers"]["water"], res_b["parameters"]["modifiers"]["water"]),
            ("Weather Condition", "weather", res_a["parameters"]["modifiers"]["weather"], res_b["parameters"]["modifiers"]["weather"]),
            ("Planting Schedule", "planting", res_a["parameters"]["modifiers"]["planting"], res_b["parameters"]["modifiers"]["planting"]),
            ("Fertilizer / Inputs", "fertilizer", res_a["parameters"]["modifiers"]["fertilizer"], res_b["parameters"]["modifiers"]["fertilizer"])
        ]

        # Calculate log changes
        log_ratios = []
        for name, key, val_a, val_b in factors_to_compare:
            if val_a > 0 and val_b > 0:
                l = math.log(val_b / val_a)
            else:
                l = 0.0
            log_ratios.append((name, key, val_a, val_b, l))

        total_log = sum(item[4] for item in log_ratios)

        delta_attribution = []
        if abs(total_log) > 1e-9 and abs(delta_yield) > 1e-9:
            for name, key, val_a, val_b, l in log_ratios:
                attributed_delta = round(delta_yield * (l / total_log), 4)
                share_pct = round((attributed_delta / delta_yield) * 100.0, 1)
                delta_attribution.append({
                    "factor_name": name,
                    "factor_key": key,
                    "value_scenario_a": round(val_a, 4),
                    "value_scenario_b": round(val_b, 4),
                    "attributed_yield_delta_t_ha": attributed_delta,
                    "share_of_total_change_pct": share_pct
                })
        else:
            for name, key, val_a, val_b, l in log_ratios:
                delta_attribution.append({
                    "factor_name": name,
                    "factor_key": key,
                    "value_scenario_a": round(val_a, 4),
                    "value_scenario_b": round(val_b, 4),
                    "attributed_yield_delta_t_ha": 0.0,
                    "share_of_total_change_pct": 0.0
                })

        # Identify primary and secondary drivers of delta
        drivers = [item for item in delta_attribution if abs(item["attributed_yield_delta_t_ha"]) > 1e-4]
        drivers.sort(key=lambda x: abs(x["attributed_yield_delta_t_ha"]), reverse=True)

        primary_driver = drivers[0]["factor_name"] if len(drivers) > 0 else "None"
        secondary_driver = drivers[1]["factor_name"] if len(drivers) > 1 else "None"

        # Automated Explainable Summary
        direction = "increase" if delta_yield >= 0 else "decrease"
        explanation = (
            f"{res_b['scenario_name']} resulted in a {abs(delta_yield)} t/ha ({pct_delta_yield}%) {direction} in yield "
            f"and a ₹{abs(delta_profit):,.2f} {'increase' if delta_profit >= 0 else 'decrease'} in net profit compared to {res_a['scenario_name']}. "
        )
        if primary_driver != "None":
            top = drivers[0]
            explanation += (
                f"The primary driver was {top['factor_name']} accounting for {top['share_of_total_change_pct']}% of the yield change "
                f"({top['attributed_yield_delta_t_ha']:+0.2f} t/ha). "
            )
        if secondary_driver != "None":
            second = drivers[1]
            explanation += (
                f"The secondary driver was {second['factor_name']} ({second['share_of_total_change_pct']}% share, "
                f"{second['attributed_yield_delta_t_ha']:+0.2f} t/ha). "
            )
        explanation += (
            f"Risk shifted from {res_a['risk']['category']} ({risk_a}/100) to {res_b['risk']['category']} ({risk_b}/100)."
        )

        return {
            "comparison_summary": {
                "scenario_a": res_a["scenario_name"],
                "scenario_b": res_b["scenario_name"],
                "delta_yield_t_ha": delta_yield,
                "pct_delta_yield": pct_delta_yield,
                "delta_total_cost_inr": delta_cost,
                "delta_net_profit_inr": delta_profit,
                "delta_water_m3": delta_water,
                "delta_risk_score": delta_risk,
                "primary_driver": primary_driver,
                "secondary_driver": secondary_driver,
                "plain_english_explanation": explanation
            },
            "metric_comparison_table": {
                "yield_t_ha": { "scenario_a": y_a, "scenario_b": y_b, "delta": delta_yield },
                "production_tonnes": { "scenario_a": res_a["yield"]["total_production_tonnes"], "scenario_b": res_b["yield"]["total_production_tonnes"], "delta": round(res_b["yield"]["total_production_tonnes"] - res_a["yield"]["total_production_tonnes"], 4) },
                "total_cost_inr": { "scenario_a": cost_a, "scenario_b": cost_b, "delta": delta_cost },
                "net_profit_inr": { "scenario_a": profit_a, "scenario_b": profit_b, "delta": delta_profit },
                "benefit_cost_ratio": { "scenario_a": res_a["costs_and_returns"]["benefit_cost_ratio"], "scenario_b": res_b["costs_and_returns"]["benefit_cost_ratio"] },
                "water_applied_m3": { "scenario_a": water_a, "scenario_b": water_b, "delta": delta_water },
                "risk_score": { "scenario_a": risk_a, "scenario_b": risk_b, "delta": delta_risk },
                "risk_category": { "scenario_a": res_a["risk"]["category"], "scenario_b": res_b["risk"]["category"] }
            },
            "inter_scenario_attribution": delta_attribution,
            "reconciliation": {
                "delta_yield": delta_yield,
                "sum_of_attributed_deltas": round(sum(item["attributed_yield_delta_t_ha"] for item in delta_attribution), 4),
                "is_reconciled": abs(sum(item["attributed_yield_delta_t_ha"] for item in delta_attribution) - delta_yield) < 1e-4
            }
        }
