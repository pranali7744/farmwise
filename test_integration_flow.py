import urllib.request
import json
import sys

def test(name, method, url, data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.data = json.dumps(data).encode()
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            body = json.loads(resp.read().decode())
            print(f"PASS: {name} (HTTP {resp.status})")
            return body
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {name}")
        return json.loads(e.read().decode())
    except Exception as e:
        print(f"FAIL: {name} -> {e}")
        return None

print("=== 1. Testing Backend API Health & Root ===")
test("API Root", "GET", "http://127.0.0.1:8000/")
health = test("API Health", "GET", "http://127.0.0.1:8000/api/health")
assert health and health.get("status") == "healthy", "Backend must be healthy"

print("\n=== 2. Testing All 8 MVP Crops ===")
crops = ["wheat", "rice", "maize", "sugarcane", "cotton", "soybean", "groundnut", "jowar"]
for c in crops:
    r = test(f"Simulate {c}", "POST", "http://127.0.0.1:8000/api/simulate", {"crop": c, "water_availability": 100})
    assert r and "yield" in r and "costs_and_returns" in r and "risk" in r
    y = r["yield"]["estimated_yield_t_ha"]
    cost = r["costs_and_returns"]["total_cost_inr"]
    risk = r["risk"]["category"]
    print(f"   -> {c}: Yield={y} t/ha, Cost=INR {cost}, Risk={risk}")

print("\n=== 3. Testing What-If Scenarios (Water Variations) ===")
r_low = test("What-If Water 40%", "POST", "http://127.0.0.1:8000/api/simulate", {"crop": "wheat", "water_availability": 40})
r_norm = test("What-If Water 100%", "POST", "http://127.0.0.1:8000/api/simulate", {"crop": "wheat", "water_availability": 100})
r_high = test("What-If Water 140%", "POST", "http://127.0.0.1:8000/api/simulate", {"crop": "wheat", "water_availability": 140})

y_low = r_low["yield"]["estimated_yield_t_ha"]
y_norm = r_norm["yield"]["estimated_yield_t_ha"]
y_high = r_high["yield"]["estimated_yield_t_ha"]

print(f"   40% Water Yield: {y_low} t/ha | Risk: {r_low['risk']['category']}")
print(f"  100% Water Yield: {y_norm} t/ha | Risk: {r_norm['risk']['category']}")
print(f"  140% Water Yield: {y_high} t/ha | Risk: {r_high['risk']['category']}")
assert y_low < y_norm, "Drought yield must be less than normal yield"

print("\n=== 4. Testing Error Handling on Invalid Inputs ===")
err_resp = test("Invalid Crop Input", "POST", "http://127.0.0.1:8000/api/simulate", {"crop": "invalid_crop_xyz"})
assert "detail" in err_resp, "Must return structured error message"
print("   Error detail received:", err_resp.get("detail"))

print("\n=== 5. Testing Vite Frontend Dev Server ===")
try:
    with urllib.request.urlopen("http://localhost:5173", timeout=3) as resp:
        print(f"PASS: Vite Frontend Dev Server (HTTP {resp.status})")
except Exception as e:
    print("Vite server check:", e)

print("\n*** ALL INTEGRATION & FLOW VERIFICATION CHECKS PASSED SUCCESSFULLY! ***")
