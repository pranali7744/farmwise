"""
Comprehensive Unit Tests for FarmWise Simulation Engine.
Agri PS01: Scenario & Decision Simulator
DSSA PRARAMBHA 2.0 Hackathon
"""

import unittest
from simulation_engine import SimulationEngine


class TestFarmWiseSimulationEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.engine = SimulationEngine()

    # -------------------------------------------------------------------------
    # 1. Test All 8 MVP Crops
    # -------------------------------------------------------------------------
    def test_all_eight_crops(self):
        """Verify all 8 MVP crops simulate properly with valid outputs and reconciled attributions."""
        crops = ["rice", "wheat", "jowar", "cotton", "maize", "sugarcane", "soybean", "groundnut"]
        for crop in crops:
            inputs = {
                "scenario_name": f"Test {crop.title()}",
                "crop": crop,
                "farm_size_ha": 2.0,
                "water_availability": "adequate",
                "weather": "normal",
                "planting_date": "optimal",
                "fertilizer": "recommended"
            }
            res = self.engine.simulate(inputs)
            
            # Check presence of all core modules
            self.assertIn("yield", res)
            self.assertIn("costs_and_returns", res)
            self.assertIn("water_applied_allocated", res)
            self.assertIn("risk", res)
            self.assertIn("factor_attribution", res)
            self.assertIn("reconciliation", res)

            # Check positive quantities
            y = res["yield"]["estimated_yield_t_ha"]
            cost = res["costs_and_returns"]["total_cost_inr"]
            water = res["water_applied_allocated"]["total_water_m3"]
            
            self.assertGreater(y, 0.0, f"Yield for {crop} must be positive")
            self.assertGreater(cost, 0.0, f"Cost for {crop} must be positive")
            self.assertGreater(water, 0.0, f"Water for {crop} must be positive")
            self.assertTrue(res["reconciliation"]["is_reconciled"], f"Attribution must reconcile for {crop}")

    # -------------------------------------------------------------------------
    # 2. Test Water Modes: Severe Deficit, Moderate Deficit, Adequate, Surplus/Excessive
    # -------------------------------------------------------------------------
    def test_water_deficit_modes(self):
        """Verify severe deficit, moderate deficit, and adequate water levels for wheat."""
        res_severe = self.engine.simulate({"crop": "wheat", "water_availability": "severe_deficit"})
        res_mod = self.engine.simulate({"crop": "wheat", "water_availability": "moderate_deficit"})
        res_adeq = self.engine.simulate({"crop": "wheat", "water_availability": "adequate"})

        y_severe = res_severe["yield"]["estimated_yield_t_ha"]
        y_mod = res_mod["yield"]["estimated_yield_t_ha"]
        y_adeq = res_adeq["yield"]["estimated_yield_t_ha"]

        # Severe deficit < Moderate deficit < Adequate
        self.assertLess(y_severe, y_mod)
        self.assertLess(y_mod, y_adeq)

        # Check numerical water factor for wheat (Ky = 1.15)
        # Moderate deficit is 75% -> f_water = 1.0 - 1.15 * (1 - 0.75) = 0.7125
        f_water_mod = res_mod["parameters"]["modifiers"]["water"]
        self.assertAlmostEqual(f_water_mod, 0.7125, places=3)

    def test_water_surplus_and_excessive_modes(self):
        """Verify surplus/excessive behavior: rice tolerates flood; maize suffers hypoxia."""
        # 1. Rice (semi-aquatic): flood tolerant up to 130%
        res_rice_opt = self.engine.simulate({"crop": "rice", "water_availability": "adequate"})
        res_rice_surplus = self.engine.simulate({"crop": "rice", "water_availability": "slight_surplus"})
        self.assertEqual(res_rice_opt["parameters"]["modifiers"]["water"], 1.0)
        self.assertEqual(res_rice_surplus["parameters"]["modifiers"]["water"], 1.0)

        # 2. Maize (upland): aeration stress under excessive water
        res_maize_opt = self.engine.simulate({"crop": "maize", "water_availability": "adequate"})
        res_maize_excess = self.engine.simulate({"crop": "maize", "water_availability": "excessive"})
        f_water_excess = res_maize_excess["parameters"]["modifiers"]["water"]
        self.assertLess(f_water_excess, 1.0, "Maize should suffer penalty under excessive water")
        self.assertLess(res_maize_excess["yield"]["estimated_yield_t_ha"], res_maize_opt["yield"]["estimated_yield_t_ha"])

        # Also test with string alias "surplus/excessive"
        res_alias = self.engine.simulate({"crop": "maize", "water_availability": "surplus/excessive"})
        self.assertAlmostEqual(res_alias["parameters"]["modifiers"]["water"], f_water_excess, places=3)

    def test_water_availability_consistent_convention(self):
        """
        Verify consistent convention across the engine:
          0   = 0% of requirement (max drought stress, f_water=0.15, water_risk=100)
          50  = 50% of requirement (severe deficit, f_water=0.425, water_risk=92)
          75  = 75% of requirement (moderate deficit, f_water=0.7125, water_risk=46)
          100 = 100% of requirement (adequate water, f_water=1.0000, water_risk=0)
          125 = 125% of requirement (slight surplus/hypoxia, f_water=0.875, water_risk=15)
          150 = 150% of requirement (excessive/flood, f_water=0.750, water_risk=52.5)
        """
        expected_benchmarks = [
            # (input_val, exp_pct, exp_ratio, exp_f_water, exp_water_risk, exp_risk_has_stress)
            (0, 0.0, 0.0, 0.15, 100.0, True),
            (50, 50.0, 0.50, 0.425, 92.0, True),
            (75, 75.0, 0.75, 0.7125, 46.0, True),
            (100, 100.0, 1.00, 1.0000, 0.0, False),
            (125, 125.0, 1.25, 0.875, 15.0, False),
            (150, 150.0, 1.50, 0.75, 52.5, True)
        ]

        for val, exp_pct, exp_ratio, exp_f, exp_risk, exp_has_stress in expected_benchmarks:
            res = self.engine.simulate({"crop": "wheat", "water_availability": val})
            
            # 1. Parameter normalization verification
            self.assertEqual(res["parameters"]["water_availability_pct"], exp_pct)
            self.assertEqual(res["parameters"]["water_ratio"], exp_ratio)
            self.assertEqual(res["inputs"]["water_availability"], f"{int(exp_pct)}% of requirement")

            # 2. Yield water modifier verification
            f_water = res["parameters"]["modifiers"]["water"]
            self.assertAlmostEqual(f_water, exp_f, places=4, msg=f"f_water mismatch for water_availability={val}")

            # 3. Water sub-risk verification
            sub_risk = res["risk"]["sub_risks"]["water_risk"]
            self.assertAlmostEqual(sub_risk, exp_risk, places=2, msg=f"water_risk mismatch for water_availability={val}")

            # 4. Stress attribution: 100% water must not have water stress risk
            if val == 100:
                self.assertEqual(sub_risk, 0.0)
                self.assertNotIn("Water Stress", res["risk"]["primary_contributing_factor"])

            # 5. Resource volume internal consistency
            w_res = res["water_applied_allocated"]
            total_m3 = w_res["total_water_m3"]
            rain_m3 = w_res["rainfall_contribution_m3"]
            irr_m3 = w_res["irrigation_pumped_m3"]
            self.assertAlmostEqual(total_m3, round(rain_m3 + irr_m3, 2), places=2)

            total_depth = w_res["water_depth_mm"]
            if val == 0:
                self.assertEqual(total_m3, 0.0)
                self.assertEqual(total_depth, 0.0)

    def test_wheat_100_percent_scenario_verification(self):
        """
        Verify the real-world scenario specified by the user:
          crop = wheat, soil = black_soil, state = Maharashtra, farm_size = 1,
          water_availability = 100, weather = normal, planting_window = optimal,
          fertilizer_level = recommended.
        
        Must NOT produce 250% requirement, water modifier 0.5, or Water Stress hazard.
        """
        scenario = {
            "crop": "wheat",
            "soil": "black_soil",
            "state": "Maharashtra",
            "farm_size": 1,
            "water_availability": 100,
            "weather": "normal",
            "planting_window": "optimal",
            "fertilizer": "recommended"
        }
        res = self.engine.simulate(scenario)

        # Inputs interpretation
        self.assertEqual(res["inputs"]["water_availability"], "100% of requirement")
        self.assertEqual(res["parameters"]["water_availability_pct"], 100.0)
        self.assertEqual(res["parameters"]["water_ratio"], 1.0)

        # Water modifier and Yield
        self.assertEqual(res["parameters"]["modifiers"]["water"], 1.0000)
        self.assertAlmostEqual(res["yield"]["estimated_yield_t_ha"], 3.8, places=2)

        # Risk classification and hazard factors
        self.assertEqual(res["risk"]["category"], "Low")
        self.assertEqual(res["risk"]["sub_risks"]["water_risk"], 0.0)
        self.assertNotIn("Water Stress", res["risk"]["primary_contributing_factor"])

        # Resource internal consistency
        w_applied = res["water_applied_allocated"]
        self.assertAlmostEqual(
            w_applied["total_water_m3"],
            w_applied["rainfall_contribution_m3"] + w_applied["irrigation_pumped_m3"],
            places=2
        )
        self.assertAlmostEqual(
            w_applied["rainfall_share_pct"] + w_applied["irrigation_share_pct"],
            100.0,
            places=1
        )

    # -------------------------------------------------------------------------
    # 3. Test All Fertilizer Levels & Aliases
    # -------------------------------------------------------------------------
    def test_all_fertilizer_levels_and_aliases(self):
        """Verify low, moderate, recommended, high, excessive, organic, and their aliases."""
        levels = ["low", "moderate", "recommended", "high", "excessive", "organic"]
        for level in levels:
            res = self.engine.simulate({"crop": "wheat", "fertilizer": level})
            mod = res["parameters"]["modifiers"]["fertilizer"]
            self.assertGreater(mod, 0.0)

        # Test aliases:
        # "balanced" -> "recommended"
        res_balanced = self.engine.simulate({"crop": "wheat", "fertilizer": "balanced"})
        self.assertEqual(res_balanced["parameters"]["fertilizer_level"], "recommended")
        self.assertEqual(res_balanced["parameters"]["modifiers"]["fertilizer"], 1.00)

        # "organic_bio" -> "organic"
        res_bio = self.engine.simulate({"crop": "wheat", "fertilizer": "organic_bio"})
        self.assertEqual(res_bio["parameters"]["fertilizer_level"], "organic")
        self.assertEqual(res_bio["parameters"]["modifiers"]["fertilizer"], 0.86)

        # "organic / bio" -> "organic"
        res_slash_bio = self.engine.simulate({"crop": "wheat", "fertilizer": "organic / bio"})
        self.assertEqual(res_slash_bio["parameters"]["fertilizer_level"], "organic")
        self.assertEqual(res_slash_bio["parameters"]["modifiers"]["fertilizer"], 0.86)

    # -------------------------------------------------------------------------
    # 4. Test All Planting Windows, Aliases & Weather Profiles
    # -------------------------------------------------------------------------
    def test_all_planting_windows_and_aliases(self):
        """Verify optimal, early, late, very_late and aliases."""
        windows = ["optimal", "early", "late", "very_late"]
        yields = []
        for win in windows:
            res = self.engine.simulate({"crop": "wheat", "planting_date": win})
            yields.append(res["yield"]["estimated_yield_t_ha"])

        # Monotonic decay
        self.assertGreater(yields[0], yields[1])
        self.assertGreater(yields[1], yields[2])
        self.assertGreater(yields[2], yields[3])

        # Test aliases:
        # "late_sowing" -> "late"
        res_late_sow = self.engine.simulate({"crop": "wheat", "planting_date": "late_sowing"})
        self.assertEqual(res_late_sow["parameters"]["planting_window"], "late")
        self.assertEqual(res_late_sow["parameters"]["modifiers"]["planting"], 0.86)

        # "late_15_30" -> "late"
        res_late_15 = self.engine.simulate({"crop": "wheat", "planting_date": "late_15_30"})
        self.assertEqual(res_late_15["parameters"]["planting_window"], "late")
        self.assertEqual(res_late_15["parameters"]["modifiers"]["planting"], 0.86)

        # "very_late_gt_30" -> "very_late"
        res_vl_gt = self.engine.simulate({"crop": "wheat", "planting_date": "very_late_gt_30"})
        self.assertEqual(res_vl_gt["parameters"]["planting_window"], "very_late")
        self.assertEqual(res_vl_gt["parameters"]["modifiers"]["planting"], 0.72)

        # "delayed" -> "very_late"
        res_delayed = self.engine.simulate({"crop": "wheat", "planting_date": "delayed"})
        self.assertEqual(res_delayed["parameters"]["planting_window"], "very_late")
        self.assertEqual(res_delayed["parameters"]["modifiers"]["planting"], 0.72)

    def test_all_weather_profiles(self):
        """Verify optimal, normal, moderate_heatwave, severe_drought, unseasonal_rain."""
        weathers = ["optimal", "normal", "moderate_heatwave", "severe_drought", "unseasonal_rain"]
        for w in weathers:
            res = self.engine.simulate({"crop": "wheat", "weather": w})
            mod = res["parameters"]["modifiers"]["weather"]
            self.assertGreater(mod, 0.0)

        res_opt = self.engine.simulate({"crop": "wheat", "weather": "optimal"})
        res_norm = self.engine.simulate({"crop": "wheat", "weather": "normal"})
        res_heat = self.engine.simulate({"crop": "wheat", "weather": "moderate_heatwave"})
        res_drought = self.engine.simulate({"crop": "wheat", "weather": "severe_drought"})

        self.assertGreater(res_opt["yield"]["estimated_yield_t_ha"], res_norm["yield"]["estimated_yield_t_ha"])
        self.assertGreater(res_norm["yield"]["estimated_yield_t_ha"], res_heat["yield"]["estimated_yield_t_ha"])
        self.assertGreater(res_heat["yield"]["estimated_yield_t_ha"], res_drought["yield"]["estimated_yield_t_ha"])

    # -------------------------------------------------------------------------
    # 5. Test Strict Risk Classification Boundaries
    # -------------------------------------------------------------------------
    def test_risk_classification_boundaries(self):
        """
        Verify strict risk classification:
          Low    <= 30.0
          Medium > 30.0 and <= 65.0
          High   > 65.0
        """
        # 1. Low Risk Boundary (score <= 30.0)
        # Optimal Wheat in Punjab
        res_low = self.engine.simulate({
            "crop": "wheat",
            "state": "punjab",
            "soil": "alluvial_loam",
            "water_availability": "adequate",
            "weather": "normal",
            "planting_date": "optimal",
            "fertilizer": "recommended"
        })
        self.assertLessEqual(res_low["risk"]["score"], 30.0)
        self.assertEqual(res_low["risk"]["category"], "Low")

        # Boundary test: score 28.6 must be Low
        res_boundary = self.engine.simulate({
            "crop": "wheat",
            "state": "punjab",
            "soil": "alluvial_loam",
            "water_availability": 0.75,
            "weather": "normal",
            "planting_date": "late",
            "fertilizer": "recommended"
        })
        self.assertAlmostEqual(res_boundary["risk"]["score"], 28.6, delta=0.5)
        self.assertEqual(res_boundary["risk"]["category"], "Low")

        # 2. Medium Risk Boundary (30.0 < score <= 65.0)
        res_med = self.engine.simulate({
            "crop": "wheat",
            "water_availability": 0.60,
            "weather": "moderate_heatwave",
            "planting_date": "late"
        })
        self.assertGreater(res_med["risk"]["score"], 30.0)
        self.assertLessEqual(res_med["risk"]["score"], 65.0)
        self.assertEqual(res_med["risk"]["category"], "Medium")

        # 3. High Risk Boundary (score > 65.0)
        res_high = self.engine.simulate({
            "crop": "wheat",
            "water_availability": 0.40,
            "weather": "severe_drought",
            "planting_date": "very_late",
            "fertilizer": "low"
        })
        self.assertGreater(res_high["risk"]["score"], 65.0)
        self.assertEqual(res_high["risk"]["category"], "High")

    # -------------------------------------------------------------------------
    # 6. Test Single Scenario Factor Attribution Reconciliation
    # -------------------------------------------------------------------------
    def test_single_scenario_factor_attribution_reconciliation(self):
        """
        Verify mathematically that:
          sum(factor_impacts) == final_yield - base_yield
        across various combinations.
        """
        scenarios = [
            {"crop": "wheat", "water_availability": 0.75, "planting_date": "late", "weather": "normal", "fertilizer": "recommended"},
            {"crop": "rice", "water_availability": 0.60, "planting_date": "optimal", "weather": "moderate_heatwave", "fertilizer": "high"},
            {"crop": "cotton", "water_availability": 1.20, "planting_date": "early", "weather": "unseasonal_rain", "fertilizer": "excessive"},
            {"crop": "sugarcane", "water_availability": 0.50, "planting_date": "late", "weather": "severe_drought", "fertilizer": "low"},
            {"crop": "soybean", "water_availability": 0.80, "planting_date": "optimal", "weather": "normal", "fertilizer": "organic"},
            {"crop": "groundnut", "water_availability": 0.70, "planting_date": "early", "weather": "optimal", "fertilizer": "moderate"}
        ]

        for s in scenarios:
            res = self.engine.simulate(s)
            reconcil = res["reconciliation"]
            self.assertTrue(reconcil["is_reconciled"], f"Failed reconciliation for {s}")
            self.assertAlmostEqual(
                reconcil["sum_of_factor_deltas"],
                reconcil["actual_net_change"],
                places=4,
                msg=f"Sum of factor impacts must equal final_yield - base_yield for {s['crop']}"
            )

    # -------------------------------------------------------------------------
    # 7. Test Scenario A vs B Inter-Scenario Attribution Reconciliation
    # -------------------------------------------------------------------------
    def test_scenario_comparison_and_reconciliation(self):
        """
        Verify mathematically that:
          sum(attributed_yield_deltas) == yield_B - yield_A
        """
        scenario_a = {
            "scenario_name": "Scenario A (Optimal)",
            "crop": "wheat",
            "state": "punjab",
            "water_availability": 1.0,
            "planting_date": "optimal",
            "weather": "normal",
            "fertilizer": "recommended"
        }
        scenario_b = {
            "scenario_name": "Scenario B (Deficit & Late)",
            "crop": "wheat",
            "state": "punjab",
            "water_availability": 0.75,
            "planting_date": "late",
            "weather": "normal",
            "fertilizer": "recommended"
        }

        comp = self.engine.compare_scenarios(scenario_a, scenario_b)
        
        self.assertIn("comparison_summary", comp)
        self.assertIn("inter_scenario_attribution", comp)
        self.assertTrue(comp["reconciliation"]["is_reconciled"])

        delta_yield = comp["comparison_summary"]["delta_yield_t_ha"]
        sum_attributed = comp["reconciliation"]["sum_of_attributed_deltas"]
        self.assertAlmostEqual(delta_yield, sum_attributed, places=4)
        self.assertIn("plain_english_explanation", comp["comparison_summary"])

    # -------------------------------------------------------------------------
    # 8. Test Terminology: "Water Applied/Allocated"
    # -------------------------------------------------------------------------
    def test_water_terminology(self):
        """Verify user-facing dictionary uses 'water_applied_allocated' terminology."""
        res = self.engine.simulate({"crop": "wheat"})
        self.assertIn("water_applied_allocated", res)
        water_dict = res["water_applied_allocated"]
        self.assertIn("total_water_m3", water_dict)
        self.assertIn("water_depth_mm", water_dict)
        self.assertIn("rainfall_contribution_m3", water_dict)
        self.assertIn("irrigation_pumped_m3", water_dict)

    # -------------------------------------------------------------------------
    # 9. Test Robust Input Validation & Error Handling
    # -------------------------------------------------------------------------
    def test_robust_input_validation(self):
        """Verify invalid crop, soil, weather, planting, fertilizer, farm size raise ValueError."""
        # Invalid crop
        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "unknown_crop"})

        # Invalid soil
        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "wheat", "soil": "martian_dust"})

        # Invalid weather
        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "wheat", "weather": "tornado_blizzard"})

        # Invalid planting window
        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "wheat", "planting_date": "mid_season_strike"})

        # Invalid fertilizer level
        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "wheat", "fertilizer": "magic_potion"})

        # Invalid farm size (<= 0)
        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "wheat", "farm_size_ha": 0.0})

        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "wheat", "farm_size_ha": -5.0})

        # Invalid water availability (string and negative)
        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "wheat", "water_availability": "unknown_water_mode"})

        with self.assertRaises(ValueError):
            self.engine.simulate({"crop": "wheat", "water_availability": -10.0})


if __name__ == "__main__":
    unittest.main()
