# FarmWise - Simulation Engine
# Agri PS01: Scenario & Decision Simulator


def calculate_yield(base_yield, soil_factor, water_factor,
                    weather_factor, planting_factor, input_factor):

    final_yield = (
        base_yield
        * soil_factor
        * water_factor
        * weather_factor
        * planting_factor
        * input_factor
    )

    return round(final_yield, 2)


# Test simulation
if __name__ == "__main__":

    base_yield = 4.0       # tons/hectare

    soil_factor = 1.0
    water_factor = 0.9
    weather_factor = 1.0
    planting_factor = 0.95
    input_factor = 1.0

    result = calculate_yield(
        base_yield,
        soil_factor,
        water_factor,
        weather_factor,
        planting_factor,
        input_factor
    )

    print("FarmWise Simulation")
    print("-------------------")
    print("Estimated Yield:", result, "tons/hectare")
