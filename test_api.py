"""
Unit and Integration Tests for FarmWise FastAPI Backend.
Agri PS01: Scenario & Decision Simulator
DSSA PRARAMBHA 2.0 Hackathon
"""

import unittest
from fastapi.testclient import TestClient
from api.main import app


class TestFarmWiseAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_endpoint(self):
        """Verify GET / returns metadata and expected endpoints."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("docs_url", data)
        self.assertIn("health_url", data)
        self.assertIn("simulate_url", data)

    def test_health_endpoint(self):
        """Verify GET /api/health returns healthy service status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertEqual(data.get("service"), "farmwise-api")
        self.assertEqual(data.get("engine"), "SimulationEngine")

    def test_simulate_default_wheat(self):
        """Verify POST /api/simulate runs successfully with default payload."""
        response = self.client.post("/api/simulate", json={"crop": "wheat"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("yield", data)
        self.assertIn("costs_and_returns", data)
        self.assertIn("water_applied_allocated", data)
        self.assertIn("risk", data)
        self.assertIn("factor_attribution", data)
        self.assertIn("reconciliation", data)
        self.assertGreater(data["yield"]["estimated_yield_t_ha"], 0.0)

    def test_simulate_maharashtra_wheat_scenario(self):
        """Verify POST /api/simulate with 100% water wheat scenario in Maharashtra."""
        payload = {
            "crop": "wheat",
            "soil": "black_soil",
            "state": "Maharashtra",
            "farm_size": 1.0,
            "water_availability": 100,
            "weather": "normal",
            "planting_date": "optimal",
            "fertilizer": "recommended"
        }
        response = self.client.post("/api/simulate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["inputs"]["water_availability"], "100% of requirement")
        self.assertEqual(data["parameters"]["modifiers"]["water"], 1.0)
        self.assertAlmostEqual(data["yield"]["estimated_yield_t_ha"], 3.8, places=2)
        self.assertEqual(data["risk"]["category"], "Low")
        self.assertEqual(data["risk"]["sub_risks"]["water_risk"], 0.0)
        self.assertNotIn("Water Stress", data["risk"]["primary_contributing_factor"])

    def test_simulate_cors_headers(self):
        """Verify CORS headers for frontend requests."""
        response = self.client.options(
            "/api/simulate",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("access-control-allow-origin"), "http://localhost:5173")

    def test_simulate_validation_errors(self):
        """Verify invalid crop or negative farm size raises proper error codes."""
        # Unknown crop should return 400
        res_crop = self.client.post("/api/simulate", json={"crop": "imaginary_crop"})
        self.assertEqual(res_crop.status_code, 400)
        self.assertIn("Invalid crop", res_crop.json()["detail"])

        # Negative farm size should return 422 (Pydantic validation error)
        res_size = self.client.post("/api/simulate", json={"crop": "wheat", "farm_size_ha": -2.0})
        self.assertEqual(res_size.status_code, 422)


if __name__ == "__main__":
    unittest.main()
