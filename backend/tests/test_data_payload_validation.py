from __future__ import annotations

import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

import mongo_api as api  # noqa: E402


def test_sanitize_site_payload_normalizes_units_and_months():
    payload = {
        "sites": {
            "site-1": {
                "data": {
                    "transport": [
                        {
                            "description": "fleet",
                            "year": 2035,
                            "months": [1, "x", 3],
                            "emissionType": "transport_petrol",
                            "unit": "miles",
                        },
                        {
                            "description": "bad-unit",
                            "year": "foo",
                            "months": [],
                            "unit": "unknown",
                        },
                    ]
                }
            }
        }
    }
    out = api._sanitize_site_data_payload(payload)
    rows = out["sites"]["site-1"]["data"]["transport"]
    assert rows[0]["year"] == 2030
    assert rows[0]["unit"] == "miles"
    assert len(rows[0]["months"]) == 12
    assert rows[0]["months"][1] == 0.0
    assert rows[1]["year"] == 2025
    assert rows[1]["unit"] == "km"

