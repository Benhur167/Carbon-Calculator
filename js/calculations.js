// ============================================
// CARBON CALCULATOR - CALCULATIONS ENGINE
// Year/Country/Source conversion factor registry (2020-2025)
// ============================================

const SUPPORTED_YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const BASE_YEAR = 2025;

const UNIT_TO_BASE_MULTIPLIER = {
    water: { m3: 1, litres: 0.001, gallons: 0.00454609, ft3: 0.0283168 },
    energy: { kwh: 1, mwh: 1000, gj: 277.777778, mj: 0.277777778, therms: 29.3071 },
    waste: { tonnes: 1, kg: 0.001, lbs: 0.000453592 },
    transport: { km: 1, miles: 1.609344, passenger_km: 1, tonne_km: 1, night: 1, day: 1 },
    refrigerants: { kg: 1, g: 0.001, lbs: 0.453592 },
};

const SOURCE_TO_CATEGORY = {
    water: 'water',
    wastewater: 'water',
    water_reuse: 'water',
    electricity: 'energy',
    naturalGas: 'energy',
    diesel: 'energy',
    lpg: 'energy',
    coal: 'energy',
    waste: 'waste',
    wasteRecycled: 'waste',
    waste_composted: 'waste',
    waste_landfill: 'waste',
    waste_to_energy: 'waste',
    waste_to_recycling: 'waste',
    waste_to_composting: 'waste',
    transport_petrol: 'transport',
    transport_diesel: 'transport',
    transport_electric: 'transport',
    flights_short: 'transport',
    flights_medium: 'transport',
    flights_long: 'transport',
    business_travel_rail: 'transport',
    business_travel_hotel_night: 'transport',
    freight_road_tonne_km: 'transport',
    freight_air_tonne_km: 'transport',
    freight_sea_tonne_km: 'transport',
    staff_commute_car_km: 'transport',
    staff_commute_bus_km: 'transport',
    staff_commute_rail_km: 'transport',
    wfh_day: 'transport',
    materials_paper_kg: 'transport',
    materials_steel_kg: 'transport',
    car_petrol_small: 'transport',
    car_petrol_medium: 'transport',
    car_petrol_large: 'transport',
    car_petrol_average: 'transport',
    car_diesel_small: 'transport',
    car_diesel_medium: 'transport',
    car_diesel_large: 'transport',
    car_diesel_average: 'transport',
    car_hybrid_small: 'transport',
    car_hybrid_medium: 'transport',
    car_hybrid_large: 'transport',
    car_hybrid_average: 'transport',
    car_plugin_hybrid_small: 'transport',
    car_plugin_hybrid_medium: 'transport',
    car_plugin_hybrid_large: 'transport',
    car_plugin_hybrid_average: 'transport',
    motorbike_small: 'transport',
    motorbike_medium: 'transport',
    motorbike_large: 'transport',
    motorbike_average: 'transport',
    taxi_regular: 'transport',
    taxi_black_cab: 'transport',
    bus_local: 'transport',
    bus_local_london: 'transport',
    bus_local_average: 'transport',
    bus_coach: 'transport',
    rail_international: 'transport',
    rail_light_tram: 'transport',
    rail_underground: 'transport',
    flight_short_economy: 'transport',
    flight_short_average: 'transport',
    flight_short_business: 'transport',
    flight_long_economy: 'transport',
    flight_long_average: 'transport',
    flight_long_business: 'transport',
    flight_non_uk_economy: 'transport',
    flight_non_uk_average: 'transport',
    flight_non_uk_business: 'transport',
    van_diesel_average: 'transport',
    van_petrol_average: 'transport',
    hgv_diesel: 'transport',
    hgv_diesel_refrigerated: 'transport',
    freight_flight_domestic: 'transport',
    freight_flight_short_haul: 'transport',
    freight_flight_long_haul: 'transport',
    freight_flight_international: 'transport',
    rail_freight_train: 'transport',
    cargo_ship_bulk: 'transport',
    cargo_ship_general: 'transport',
    cargo_ship_container: 'transport',
    cargo_ship_vehicle: 'transport',
    cargo_ship_refrigerated: 'transport',
    hotel_uk: 'transport',
    hotel_uk_london: 'transport',
    materials_construction_avg: 'transport',
    materials_aggregates_primary: 'transport',
    materials_aggregates_reused: 'transport',
    materials_aggregates_closed_loop: 'transport',
    materials_asphalt_primary: 'transport',
    materials_asphalt_reused: 'transport',
    materials_asphalt_closed_loop: 'transport',
    materials_bricks_primary: 'transport',
    materials_concrete_primary: 'transport',
    materials_concrete_closed_loop: 'transport',
    refrigerant_R410A: 'refrigerants',
    refrigerant_R134a: 'refrigerants',
    refrigerant_R32: 'refrigerants',
    refrigerant_R404A: 'refrigerants',
    refrigerant_R407A: 'refrigerants',
    refrigerant_R407C: 'refrigerants',
    refrigerant_R408A: 'refrigerants',
};

const COUNTRY_BASE_FACTORS_2025 = {
    UK: {
        water: 0.344, wastewater: 0.708, water_reuse: 0.028,
        electricity: 0.177, naturalGas: 0.183, diesel: 0.246, lpg: 0.214, coal: 0.317,
        waste: 467.0, wasteRecycled: 21.3, waste_composted: 8.8,
        waste_landfill: 467.0, waste_to_energy: 21.28, waste_to_recycling: 21.3, waste_to_composting: 8.8,
        transport_petrol: 0.168, transport_diesel: 0.171, transport_electric: 0.053,
        flights_short: 0.156, flights_medium: 0.246, flights_long: 0.195,
        business_travel_rail: 0.036, business_travel_hotel_night: 15.0,
        freight_road_tonne_km: 0.120, freight_air_tonne_km: 0.602, freight_sea_tonne_km: 0.016142,
        staff_commute_car_km: 0.171, staff_commute_bus_km: 0.089, staff_commute_rail_km: 0.036,
        wfh_day: 0.92, materials_paper_kg: 0.94, materials_steel_kg: 1.85,
        refrigerant_R410A: 2088, refrigerant_R134a: 1430, refrigerant_R32: 675,
        refrigerant_R404A: 3922, refrigerant_R407A: 2107, refrigerant_R407C: 1774, refrigerant_R408A: 3152,
        car_petrol_small: 0.14836, car_petrol_medium: 0.18659, car_petrol_large: 0.27807, car_petrol_average: 0.1743,
        car_diesel_small: 0.13721, car_diesel_medium: 0.16637, car_diesel_large: 0.20419, car_diesel_average: 0.16844,
        car_hybrid_small: 0.10275, car_hybrid_medium: 0.10698, car_hybrid_large: 0.1448, car_hybrid_average: 0.11558,
        car_plugin_hybrid_small: 0.0586, car_plugin_hybrid_medium: 0.09251, car_plugin_hybrid_large: 0.10515, car_plugin_hybrid_average: 0.09712,
        motorbike_small: 0.08277, motorbike_medium: 0.10086, motorbike_large: 0.13237, motorbike_average: 0.11337,
        taxi_regular: 0.14549, taxi_black_cab: 0.20793,
        bus_local: 0.1195, bus_local_london: 0.07856, bus_local_average: 0.10312, bus_coach: 0.02732,
        rail_international: 0.00497, rail_light_tram: 0.02991, rail_underground: 0.0275,
        flight_short_economy: 0.15298, flight_short_average: 0.15553, flight_short_business: 0.22947,
        flight_long_economy: 0.14615, flight_long_average: 0.19085, flight_long_business: 0.42385,
        flight_non_uk_economy: 0.1392452, flight_non_uk_average: 0.18181, flight_non_uk_business: 0.40379,
        van_diesel_average: 0.2471, van_petrol_average: 0.21962, hgv_diesel: 0.8654, hgv_diesel_refrigerated: 1.0142,
        freight_flight_domestic: 2.52129, freight_flight_short_haul: 1.1681, freight_flight_long_haul: 0.59943, freight_flight_international: 0.59943,
        rail_freight_train: 0.02556, cargo_ship_bulk: 0.003539, cargo_ship_general: 0.013232, cargo_ship_container: 0.016142, cargo_ship_vehicle: 0.038581, cargo_ship_refrigerated: 0.01308,
        hotel_uk: 13.9, hotel_uk_london: 13.8,
        materials_construction_avg: 79.2678, materials_aggregates_primary: 7.7726, materials_aggregates_reused: 2.21, materials_aggregates_closed_loop: 3.2068,
        materials_asphalt_primary: 39.2125, materials_asphalt_reused: 1.7383, materials_asphalt_closed_loop: 28.6668,
        materials_bricks_primary: 241.7726, materials_concrete_primary: 131.7726, materials_concrete_closed_loop: 3.2068,
    },
    BRAZIL: {
        water: 0.421, wastewater: 0.856, water_reuse: 0.035,
        electricity: 0.233, naturalGas: 0.202, diesel: 0.264, lpg: 0.226, coal: 0.324,
        waste: 521.0, wasteRecycled: 24.6, waste_composted: 10.2,
        waste_landfill: 521.0, waste_to_energy: 25.84, waste_to_recycling: 24.6, waste_to_composting: 10.2,
        transport_petrol: 0.175, transport_diesel: 0.182, transport_electric: 0.062,
        flights_short: 0.165, flights_medium: 0.264, flights_long: 0.208,
        business_travel_rail: 0.044, business_travel_hotel_night: 18.0,
        freight_road_tonne_km: 0.134, freight_air_tonne_km: 0.649, freight_sea_tonne_km: 0.018,
        staff_commute_car_km: 0.181, staff_commute_bus_km: 0.097, staff_commute_rail_km: 0.044,
        wfh_day: 1.08, materials_paper_kg: 1.06, materials_steel_kg: 2.03,
        refrigerant_R410A: 2088, refrigerant_R134a: 1430, refrigerant_R32: 675,
    },
    BAHRAIN: {
        water: 0.560, wastewater: 0.930, water_reuse: 0.041,
        electricity: 0.590, naturalGas: 0.211, diesel: 0.268, lpg: 0.240, coal: 0.329,
        waste: 492.0, wasteRecycled: 24.4, waste_composted: 10.9,
        waste_landfill: 492.0, waste_to_energy: 24.10, waste_to_recycling: 24.4, waste_to_composting: 10.9,
        transport_petrol: 0.197, transport_diesel: 0.188, transport_electric: 0.092,
        flights_short: 0.171, flights_medium: 0.272, flights_long: 0.216,
        business_travel_rail: 0.040, business_travel_hotel_night: 20.0,
        freight_road_tonne_km: 0.141, freight_air_tonne_km: 0.677, freight_sea_tonne_km: 0.021,
        staff_commute_car_km: 0.199, staff_commute_bus_km: 0.094, staff_commute_rail_km: 0.040,
        wfh_day: 1.32, materials_paper_kg: 1.11, materials_steel_kg: 2.10,
        refrigerant_R410A: 2088, refrigerant_R134a: 1430, refrigerant_R32: 675,
    },
};

// Ensure all sheet-parity keys are available across countries by falling back to UK values
// where country-specific factors are not provided yet.
Object.keys(COUNTRY_BASE_FACTORS_2025).forEach((country) => {
    if (country === 'UK') return;
    const target = COUNTRY_BASE_FACTORS_2025[country];
    const uk = COUNTRY_BASE_FACTORS_2025.UK;
    Object.keys(uk).forEach((k) => {
        if (!(k in target)) target[k] = uk[k];
    });
});

const YEAR_MULTIPLIER = {
    2020: 1.10,
    2021: 1.08,
    2022: 1.06,
    2023: 1.04,
    2024: 1.02,
    2025: 1.00,
};

function buildDefaultRegistry() {
    const registry = {};
    Object.keys(COUNTRY_BASE_FACTORS_2025).forEach((country) => {
        registry[country] = {};
        const base = COUNTRY_BASE_FACTORS_2025[country];
        SUPPORTED_YEARS.forEach((year) => {
            const mul = YEAR_MULTIPLIER[year] || 1;
            registry[country][String(year)] = {};
            Object.keys(base).forEach((source) => {
                registry[country][String(year)][source] = Number((base[source] * mul).toFixed(8));
            });
        });
    });
    return registry;
}

const DEFAULT_CONVERSION_FACTORS = buildDefaultRegistry();
let CONVERSION_FACTORS = JSON.parse(JSON.stringify(DEFAULT_CONVERSION_FACTORS));

function _finiteNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}

/**
 * Flatten Mongo/API factor docs (DEFRA-style keys under `factors`) into the shape used by the UI
 * (`electricity`, `water`, …). Already-flat UI keys are passed through.
 */
function mapBackendNestedFactorsToUiFlat(raw) {
    if (!raw || typeof raw !== 'object') return {};
    const looksDefra = 'electricity_grid' in raw || 'water_supply' in raw;
    if (!looksDefra) {
        const out = {};
        Object.keys(raw).forEach((k) => {
            const n = _finiteNumber(raw[k]);
            if (n !== undefined) out[k] = n;
        });
        return out;
    }
    const f = raw;
    const out = {};
    const set = (uiKey, val) => {
        const n = _finiteNumber(val);
        if (n !== undefined) out[uiKey] = n;
    };
    set('water', f.water_supply);
    set('wastewater', f.water_treatment);
    set('water_reuse', f.water_reuse);
    set('electricity', f.electricity_grid);
    set('naturalGas', f.natural_gas);
    set('diesel', f.heating_oil);
    set('lpg', f.lpg);
    set('coal', f.coal);
    set('waste', f.waste_landfill);
    set('wasteRecycled', f.waste_recycled);
    set('waste_composted', f.waste_composted);
    set('waste_landfill', f.waste_landfill);
    set('waste_to_energy', f.waste_incineration);
    set('waste_to_recycling', f.waste_recycled);
    set('waste_to_composting', f.waste_composted);
    set('transport_petrol', f.car_petrol_medium);
    set('transport_diesel', f.car_diesel_medium);
    set('transport_electric', f.car_electric);
    set('business_travel_rail', f.rail_national);
    set('business_travel_hotel_night', f.hotel_stay_night);
    set('freight_road_tonne_km', f.freight_road_tonne_km);
    set('freight_air_tonne_km', f.freight_air_tonne_km);
    set('freight_sea_tonne_km', f.freight_sea_tonne_km || f.cargo_ship_container);
    set('staff_commute_car_km', f.staff_commute_car_km);
    set('staff_commute_bus_km', f.staff_commute_bus_km);
    set('staff_commute_rail_km', f.staff_commute_rail_km || f.rail_national);
    set('wfh_day', f.wfh_day);
    set('materials_paper_kg', f.materials_paper_kg);
    set('materials_steel_kg', f.materials_steel_kg || f.materials_construction_avg);
    if (_finiteNumber(f.flight_short_intl) !== undefined) {
        out.flights_short = _finiteNumber(f.flight_short_intl);
    } else if (_finiteNumber(f.flight_domestic) !== undefined) {
        out.flights_short = _finiteNumber(f.flight_domestic);
    }
    if (_finiteNumber(f.flight_domestic) !== undefined) {
        out.flights_medium = _finiteNumber(f.flight_domestic);
    } else {
        const a = _finiteNumber(f.flight_short_intl);
        const b = _finiteNumber(f.flight_long_intl);
        if (a !== undefined && b !== undefined) {
            out.flights_medium = (a + b) / 2;
        }
    }
    set('flights_long', f.flight_long_intl);
    set('refrigerant_R410A', f.refrigerant_R410A);
    set('refrigerant_R134a', f.refrigerant_R134a);
    set('refrigerant_R32', f.refrigerant_R32);
    // Keep all backend keys available for sheet-to-code parity rows.
    Object.keys(f).forEach((k) => {
        set(k, f[k]);
    });
    return out;
}

function apiDocCountryKeyToUiCountry(countryKey) {
    const u = String(countryKey || '').toUpperCase();
    if (u === 'UK' || u.startsWith('UK_')) return 'UK';
    if (u === 'BRAZIL' || u.startsWith('BRAZIL')) return 'BRAZIL';
    if (u === 'BAHRAIN' || u.startsWith('BAHRAIN')) return 'BAHRAIN';
    return null;
}

function apiDocCountryKeyToYear(countryKey) {
    const m = String(countryKey || '').toUpperCase().match(/_(20\d{2})$/);
    const year = m ? Number(m[1]) : BASE_YEAR;
    if (!SUPPORTED_YEARS.includes(year)) return BASE_YEAR;
    return year;
}

/**
 * Merge GET /api/factors payload into CONVERSION_FACTORS without breaking UK/BRAZIL keys expected by the UI.
 */
function mergeApiOrganizationFactors(apiDocs) {
    if (!Array.isArray(apiDocs) || apiDocs.length === 0) return;
    const merged = JSON.parse(JSON.stringify(CONVERSION_FACTORS));
    apiDocs.forEach((doc) => {
        if (!doc || typeof doc !== 'object') return;
        const rawInner = doc.factors && typeof doc.factors === 'object' ? doc.factors : {};
        const uiFlat = mapBackendNestedFactorsToUiFlat(rawInner);
        const uiCountry = apiDocCountryKeyToUiCountry(doc.country_key);
        const year = String(apiDocCountryKeyToYear(doc.country_key));
        if (uiCountry) {
            const defaults = (DEFAULT_CONVERSION_FACTORS[uiCountry] || {})[year] || {};
            if (!merged[uiCountry]) merged[uiCountry] = {};
            const combined = { ...defaults, ...(merged[uiCountry][year] || {}), ...uiFlat };
            merged[uiCountry][year] = sanitizeMergedCountryFactors(combined, defaults);
        } else {
            const ck = String(doc.country_key || '').trim().toUpperCase();
            if (ck) {
                if (!merged[ck]) merged[ck] = {};
                merged[ck][year] = { ...(merged[ck][year] || {}), ...uiFlat };
            }
        }
    });
    CONVERSION_FACTORS = merged;
}

/** Drop non-positive / non-numeric overrides so bad imports or zeros never wipe calculations. */
function sanitizeMergedCountryFactors(mergedBucket, defaults) {
    const out = { ...defaults };
    if (!mergedBucket || typeof mergedBucket !== 'object') return out;
    Object.keys(mergedBucket).forEach((k) => {
        const n = Number(mergedBucket[k]);
        if (Number.isFinite(n) && n > 0) {
            out[k] = n;
        }
    });
    return out;
}

function readOrgPref(key, fallback = '') {
    if (typeof window.getOrgLocalItem === 'function') {
        const scoped = window.getOrgLocalItem(key, null);
        if (scoped !== null && scoped !== '') return scoped;
    }
    const legacy = localStorage.getItem(key);
    return legacy !== null && legacy !== '' ? legacy : fallback;
}

function writeOrgPref(key, value) {
    if (typeof window.setOrgLocalItem === 'function') {
        window.setOrgLocalItem(key, value);
    } else {
        localStorage.setItem(key, value);
    }
}

// Current country selection (default UK)
let currentCountry = 'UK';
let currentOutputUnit = readOrgPref('carbonCalcOutputUnit', 'tCO2e');
let currentReportingYear = Number(readOrgPref('carbonCalcReportingYear', String(BASE_YEAR)));

function resolveCategoryFromTableId(tableId) {
    if (!tableId) return '';
    return String(tableId).replace('Table', '');
}

function toBaseUnitValue(category, unit, value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    const multipliers = UNIT_TO_BASE_MULTIPLIER[category] || {};
    const factor = multipliers[unit] ?? 1;
    return numeric * factor;
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

function normalizeRowYear(rawYear) {
    const y = Number(rawYear);
    if (Number.isInteger(y) && SUPPORTED_YEARS.includes(y)) return y;
    return BASE_YEAR;
}

function getReportingYear() {
    return normalizeRowYear(currentReportingYear);
}

function setReportingYear(year) {
    currentReportingYear = normalizeRowYear(year);
    writeOrgPref('carbonCalcReportingYear', String(currentReportingYear));
    calculateAllTotals();
    if (typeof updateDashboard === 'function') updateDashboard();
}

function getOutputUnit() {
    return currentOutputUnit === 'kgCO2e' ? 'kgCO2e' : 'tCO2e';
}

function setOutputUnit(unit) {
    currentOutputUnit = unit === 'kgCO2e' ? 'kgCO2e' : 'tCO2e';
    writeOrgPref('carbonCalcOutputUnit', currentOutputUnit);
    calculateAllTotals();
    if (typeof updateDashboard === 'function') updateDashboard();
}

function formatTonnesForDisplay(tonnes, decimals = 3) {
    const safe = Number.isFinite(Number(tonnes)) ? Number(tonnes) : 0;
    if (getOutputUnit() === 'kgCO2e') {
        return `${(safe * 1000).toFixed(Math.max(0, decimals))} kgCO₂e`;
    }
    return `${safe.toFixed(decimals)} tCO₂e`;
}

function normalizeDisplayToTonnes(value, unit) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return unit === 'kgCO2e' ? n / 1000 : n;
}

function rowMatchesReportingYear(row) {
    const rowYear = normalizeRowYear(row.querySelector('input[type="number"]:not(.month-input)')?.value);
    return rowYear === getReportingYear();
}

function resolveUiFactorBucket(year) {
    const yr = String(normalizeRowYear(year));
    let countryBucket = CONVERSION_FACTORS[currentCountry] || CONVERSION_FACTORS['UK'] || {};
    if (!countryBucket || typeof countryBucket !== 'object') {
        countryBucket = {};
    }
    const fallbackCountry = DEFAULT_CONVERSION_FACTORS[currentCountry] || DEFAULT_CONVERSION_FACTORS['UK'] || {};
    let bucket = countryBucket[yr] || fallbackCountry[yr] || {};
    // Legacy shape: full API doc stored under country->year as nested `factors` with DEFRA keys
    if (bucket.factors && typeof bucket.factors === 'object') {
        const inner = mapBackendNestedFactorsToUiFlat(bucket.factors);
        const defaults = fallbackCountry[yr] || {};
        bucket = sanitizeMergedCountryFactors({ ...defaults, ...inner }, defaults);
    }
    return bucket;
}

function factorWithDefaults(bucket, key, defaults) {
    const n = Number(bucket[key]);
    if (Number.isFinite(n) && n > 0) {
        return n;
    }
    const d = Number(defaults[key]);
    if (Number.isFinite(d) && d > 0) {
        return d;
    }
    return 0;
}

function sourceToggleEnabled(sourceKey) {
    if (sourceKey === 'business_travel_hotel_night') {
        return readOrgPref('hotelStayEnabled', 'true') !== 'false';
    }
    if (sourceKey === 'wfh_day') {
        return readOrgPref('wfhEnabled', 'true') !== 'false';
    }
    if (sourceKey === 'materials_paper_kg') {
        return readOrgPref('materialsEnabled', 'true') !== 'false';
    }
    return true;
}

function getRowConversionFactor(row, tableId) {
    const yearRaw = row.querySelector('input[type="number"]:not(.month-input)')?.value;
    const normalizedYear = normalizeRowYear(yearRaw);
    const bucket = resolveUiFactorBucket(normalizedYear);
    const defaults =
        (DEFAULT_CONVERSION_FACTORS[currentCountry] || DEFAULT_CONVERSION_FACTORS['UK'])[String(normalizedYear)] ||
        (DEFAULT_CONVERSION_FACTORS['UK'] || {})[String(BASE_YEAR)] ||
        {};

    const emissionSelect = row.querySelector('.emission-select');

    if (emissionSelect && emissionSelect.value) {
        if (!sourceToggleEnabled(emissionSelect.value)) return 0;
        const v = factorWithDefaults(bucket, emissionSelect.value, defaults);
        if (v > 0) {
            return v;
        }
    }

    switch (tableId) {
        case 'waterTable':
            return factorWithDefaults(bucket, 'water', defaults);
        case 'energyTable':
            return factorWithDefaults(bucket, 'electricity', defaults);
        case 'wasteTable':
            return factorWithDefaults(bucket, 'waste', defaults);
        case 'transportTable':
            return factorWithDefaults(bucket, 'transport_petrol', defaults);
        case 'refrigerantsTable':
            return factorWithDefaults(bucket, 'refrigerant_R410A', defaults);
        default:
            return 0;
    }
}

function calculateRowTotal(row) {
    const monthInputs = row.querySelectorAll('.month-input');
    let total = 0;
    
    const table = row.closest('table');
    const category = resolveCategoryFromTableId(table?.id);
    const rowUnit = row.querySelector('.row-unit-select')?.value || '';
    monthInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        total += toBaseUnitValue(category, rowUnit, value);
    });
    
    const totalCell = row.querySelector('.total-cell');
    totalCell.textContent = total.toFixed(2);
    
    calculateRowCO2(row, total);
    
    return total;
}

function calculateRowCO2(row, total) {
    const table = row.closest('table');
    const tableId = table.id;
    const conversionFactor = getRowConversionFactor(row, tableId);
    
    const co2Cell = row.querySelector('.co2-cell');
    if (total > 0 && conversionFactor <= 0) {
        co2Cell.textContent = 'N/A';
        co2Cell.title = 'Missing conversion factor for selected country/year/source.';
        row.dataset.co2Tonnes = '0';
        row.dataset.missingFactor = '1';
        return 0;
    }
    const co2e = (total * conversionFactor) / 1000; // Convert to tonnes
    row.dataset.co2Tonnes = String(co2e);
    row.dataset.missingFactor = '0';
    co2Cell.textContent = formatTonnesForDisplay(co2e);
    co2Cell.title = '';
    
    return co2e;
}

function calculateCategoryTotal(table) {
    const rows = table.querySelectorAll('.data-row');
    let categoryTotal = 0;
    
    rows.forEach(row => {
        if (!rowMatchesReportingYear(row)) return;
        const co2Value = Number(row.dataset.co2Tonnes || 0);
        categoryTotal += co2Value;
    });
    
    // Update category summary
    const tableId = table.id;
    const categoryName = tableId.replace('Table', '');
    const summaryElement = document.getElementById(`${categoryName}Total`);
    
    if (summaryElement) {
        summaryElement.textContent = formatTonnesForDisplay(categoryTotal);
    }
    
    return categoryTotal;
}

function calculateAllTotals() {
    const tables = ['water', 'energy', 'waste', 'transport', 'refrigerants'];
    let grandTotal = 0;
    
    tables.forEach(category => {
        const table = document.getElementById(`${category}Table`);
        if (table) {
            const rows = table.querySelectorAll('.data-row');
            rows.forEach(row => {
                calculateRowTotal(row);
            });
            const categoryTotal = calculateCategoryTotal(table);
            grandTotal += categoryTotal;
        }
    });
    
    return grandTotal;
}

// ============================================
// CATEGORY TOTALS
// ============================================

function getCategoryTotals() {
    const totals = {
        water: 0,
        energy: 0,
        waste: 0,
        transport: 0,
        refrigerants: 0
    };
    
    Object.keys(totals).forEach(category => {
        const table = document.getElementById(`${category}Table`);
        if (table) {
            const rows = table.querySelectorAll('.data-row');
            rows.forEach(row => {
                if (!rowMatchesReportingYear(row)) return;
                const value = Number(row.dataset.co2Tonnes || 0);
                totals[category] += value;
            });
        }
    });
    
    return totals;
}

// ============================================
// MONTHLY BREAKDOWN
// ============================================

function getMonthlyTotals() {
    const monthlyData = Array(12).fill(0);
    
    const tables = ['water', 'energy', 'waste', 'transport', 'refrigerants'];
    
    tables.forEach(category => {
        const table = document.getElementById(`${category}Table`);
        if (table) {
            const rows = table.querySelectorAll('.data-row');
            rows.forEach(row => {
                const monthInputs = row.querySelectorAll('.month-input');
                const conversionFactor = getRowConversionFactor(row, `${category}Table`);
                if (!rowMatchesReportingYear(row)) return;

                monthInputs.forEach((input, index) => {
                    const value = parseFloat(input.value) || 0;
                    const rowUnit = row.querySelector('.row-unit-select')?.value || '';
                    const baseValue = toBaseUnitValue(category, rowUnit, value);
                    const co2e = (baseValue * conversionFactor) / 1000;
                    monthlyData[index] += co2e;
                });
            });
        }
    });
    
    return monthlyData;
}

function getMonthlyTotalsByCategory() {
    const categories = ['water', 'energy', 'waste', 'transport', 'refrigerants'];
    const result = {};
    categories.forEach((category) => {
        result[category] = Array(12).fill(0);
        const table = document.getElementById(`${category}Table`);
        if (!table) return;
        table.querySelectorAll('.data-row').forEach((row) => {
            if (!rowMatchesReportingYear(row)) return;
            const conversionFactor = getRowConversionFactor(row, `${category}Table`);
            const rowUnit = row.querySelector('.row-unit-select')?.value || '';
            row.querySelectorAll('.month-input').forEach((input, idx) => {
                const baseValue = toBaseUnitValue(category, rowUnit, parseFloat(input.value) || 0);
                result[category][idx] += (baseValue * conversionFactor) / 1000;
            });
        });
    });
    return result;
}

// ============================================
// YEAR-OVER-YEAR COMPARISON
// ============================================

function getYearComparison() {
    const years = {}; // Dynamic years object
    
    // First, ensure all rows are calculated
    calculateAllTotals();
    
    const tables = ['water', 'energy', 'waste', 'transport', 'refrigerants'];
    
    tables.forEach(category => {
        const table = document.getElementById(`${category}Table`);
        if (table) {
            const rows = table.querySelectorAll('.data-row');
            rows.forEach(row => {
                // Get all inputs in row - year is always the second input
                const inputs = row.querySelectorAll('input');
                if (inputs.length >= 2) {
                    // First input is description (text), second is year (number)
                    const yearInput = inputs[1];
                    if (yearInput && yearInput.type === 'number') {
                        const year = parseInt(yearInput.value);
                        if (!isNaN(year) && year >= 2020 && year <= 2030) {
                            // Ensure row total & CO2 cell are up to date
                            if (window.carbonCalc && window.carbonCalc.calculateRowTotal) {
                                window.carbonCalc.calculateRowTotal(row);
                            }

                            // Read the already-calculated tCO₂e value from the CO2 cell
                            let co2Value = 0;
                            const co2Cell = row.querySelector('.co2-cell');
                            if (co2Cell && co2Cell.textContent) {
                                const co2Text = co2Cell.textContent.trim().replace(/[^\d.-]/g, '');
                                co2Value = parseFloat(co2Text) || 0;
                            }
                            
                            // Initialize year if not exists
                            if (!years[year]) {
                                years[year] = 0;
                            }
                            years[year] += co2Value;
                        }
                    }
                }
            });
        }
    });
    
    const yearKeys = Object.keys(years).map(y => parseInt(y, 10)).filter(y => !isNaN(y));

    // If no years found, return default structure with current year and previous years (both zero)
    if (yearKeys.length === 0) {
        const currentYear = new Date().getFullYear();
        const sortedData = {};
        sortedData[currentYear - 2] = 0;
        sortedData[currentYear - 1] = 0;
        sortedData[currentYear] = 0;
        return sortedData;
    }

    // Ensure there are always "previous year" entries with zero data:
    // if the earliest year with data is 2024, we create 2023 and 2022 with value 0.
    const minYear = Math.min(...yearKeys);
    const prevYears = [minYear - 1, minYear - 2];
    prevYears.forEach(py => {
        if (py >= 2020 && !years[py]) {
            years[py] = 0;
        }
    });

    // Now sort and return all known years (including the synthetic previous years)
    const sortedData = {};
    Object.keys(years)
        .map(y => parseInt(y, 10))
        .filter(y => !isNaN(y))
        .sort((a, b) => a - b)
        .forEach(year => {
            sortedData[year] = years[year] || 0;
        });

    return sortedData;
}

// ============================================
// COUNTRY SELECTION
// ============================================

function setCountry(country) {
    currentCountry = country.toUpperCase();
    writeOrgPref('carbonCalcCountry', currentCountry);
    
    // Recalculate all values
    calculateAllTotals();
    updateDashboard();
}

function getCountry() {
    return readOrgPref('carbonCalcCountry', 'UK') || 'UK';
}

// ============================================
// SCOPE CALCULATIONS (GHG Protocol)
// ============================================

function getScopeBreakdown() {
    // Calculate Scope breakdown by analyzing each row's emission type
    let scope1 = 0; // Direct emissions: natural gas, diesel, gasoline, fleet vehicles, refrigerants
    let scope2 = 0; // Indirect energy: electricity
    let scope3 = 0; // Other indirect: water, waste, transport (flights)
    
    const tables = ['water', 'energy', 'waste', 'transport', 'refrigerants'];
    
    tables.forEach(category => {
        const table = document.getElementById(`${category}Table`);
        if (table) {
            const rows = table.querySelectorAll('.data-row');
            rows.forEach(row => {
                if (!rowMatchesReportingYear(row)) return;
                const emissionSelect = row.querySelector('.emission-select');
                const co2Value = Number(row.dataset.co2Tonnes || 0);
                
                if (emissionSelect) {
                    const emissionType = emissionSelect.value;
                    if (!sourceToggleEnabled(emissionType)) return;

                    const scope1Keys = new Set([
                        'naturalGas', 'diesel', 'lpg', 'coal', 'transport_petrol', 'transport_diesel',
                        'refrigerant_R410A', 'refrigerant_R134a', 'refrigerant_R32',
                        'refrigerant_R404A', 'refrigerant_R407A', 'refrigerant_R407C', 'refrigerant_R408A'
                    ]);
                    const inferredCategory = SOURCE_TO_CATEGORY[emissionType] || '';

                    if (scope1Keys.has(emissionType) || emissionType.startsWith('refrigerant_')) {
                        scope1 += co2Value;
                    } else if (emissionType === 'electricity') {
                        scope2 += co2Value;
                    } else if (inferredCategory === 'water' || inferredCategory === 'waste' || inferredCategory === 'transport' || inferredCategory === 'energy') {
                        scope3 += co2Value;
                    }
                }
            });
        }
    });

    // If the user disabled specific scopes in "Assessment Scope", zero them out.
    const scope1El = document.getElementById('scope1EnabledInput');
    const scope2El = document.getElementById('scope2EnabledInput');
    const scope3El = document.getElementById('scope3EnabledInput');
    if (scope1El && !scope1El.checked) scope1 = 0;
    if (scope2El && !scope2El.checked) scope2 = 0;
    if (scope3El && !scope3El.checked) scope3 = 0;
    
    return {
        scope1: scope1,
        scope2: scope2,
        scope3: scope3
    };
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', function() {
    // Load saved country
    currentCountry = getCountry();
    
    // Initial calculation
    setTimeout(() => {
        calculateAllTotals();
    }, 500);
});

// Export functions for use in other modules
window.carbonCalc = {
    calculateRowTotal,
    calculateCategoryTotal,
    calculateAllTotals,
    getCategoryTotals,
    getMonthlyTotals,
    getMonthlyTotalsByCategory,
    getYearComparison,
    getScopeBreakdown,
    setOutputUnit,
    getOutputUnit,
    setReportingYear,
    getReportingYear,
    formatTonnesForDisplay,
    normalizeDisplayToTonnes,
    setCountry,
    getCountry,
    CONVERSION_FACTORS,
    // Allow external code (e.g. import/export tools) to replace factors database
    setConversionFactors: function (newDb) {
        if (!newDb || typeof newDb !== 'object') return;
        const sanitized = JSON.parse(JSON.stringify(DEFAULT_CONVERSION_FACTORS));
        Object.keys(newDb).forEach((country) => {
            if (!sanitized[country]) sanitized[country] = {};
            Object.keys(newDb[country] || {}).forEach((year) => {
                const def = (DEFAULT_CONVERSION_FACTORS[country] || {})[year] || {};
                const merged = {
                    ...def,
                    ...((newDb[country] || {})[year] || {}),
                };
                sanitized[country][year] = sanitizeMergedCountryFactors(merged, def);
            });
        });
        CONVERSION_FACTORS = sanitized;
    },
    mergeApiOrganizationFactors,
    getConversionFactors: function () {
        return CONVERSION_FACTORS;
    }
};


