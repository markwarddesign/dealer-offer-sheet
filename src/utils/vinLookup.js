export const lookupVin = async (vin) => {
    if (!vin || vin.length < 11) { // Basic VIN validation
        throw new Error("Invalid VIN provided.");
    }
    try {
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        const results = data.Results[0];

        if (results.ErrorCode !== "0") {
             // "0" means success, other codes indicate errors.
             // e.g. "1" for "VIN length is not 17", "5" for "VIN not found"
            throw new Error(results.ErrorText);
        }

        return {
            year: results.ModelYear,
            make: results.Make,
            model: results.Model,
            trim: results.Trim,
            mpg: results.CombinedFuelEconomy,
        };
    } catch (error) {
        console.error("VIN lookup failed:", error);
        throw error; // Re-throw to be caught by the calling function
    }
};
