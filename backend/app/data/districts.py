"""
District coordinates lookup — maps district names to GPS coordinates for API calls.
Covers all districts referenced in the frontend codebases.
"""

DISTRICT_COORDINATES = {
    # Madhya Pradesh
    "Vidisha": {"lat": 23.52, "lng": 77.81, "state": "Madhya Pradesh"},
    "Bhopal": {"lat": 23.26, "lng": 77.41, "state": "Madhya Pradesh"},
    "Sehore": {"lat": 23.20, "lng": 77.08, "state": "Madhya Pradesh"},
    "Raisen": {"lat": 23.33, "lng": 77.78, "state": "Madhya Pradesh"},
    "Hoshangabad": {"lat": 22.75, "lng": 77.73, "state": "Madhya Pradesh"},

    # Maharashtra
    "Nashik": {"lat": 20.00, "lng": 73.78, "state": "Maharashtra"},
    "Pune": {"lat": 18.52, "lng": 73.86, "state": "Maharashtra"},
    "Aurangabad": {"lat": 19.88, "lng": 75.34, "state": "Maharashtra"},
    "Nagpur": {"lat": 21.15, "lng": 79.09, "state": "Maharashtra"},
    "Osmanabad": {"lat": 18.18, "lng": 76.04, "state": "Maharashtra"},

    # Uttar Pradesh
    "Lucknow": {"lat": 26.85, "lng": 80.95, "state": "Uttar Pradesh"},
    "Kanpur": {"lat": 26.45, "lng": 80.35, "state": "Uttar Pradesh"},
    "Varanasi": {"lat": 25.32, "lng": 82.99, "state": "Uttar Pradesh"},
    "Meerut": {"lat": 28.98, "lng": 77.71, "state": "Uttar Pradesh"},

    # Punjab
    "Ludhiana": {"lat": 30.90, "lng": 75.86, "state": "Punjab"},
    "Amritsar": {"lat": 31.63, "lng": 74.87, "state": "Punjab"},
    "Patiala": {"lat": 30.34, "lng": 76.39, "state": "Punjab"},

    # Bihar
    "Patna": {"lat": 25.61, "lng": 85.14, "state": "Bihar"},
    "Gaya": {"lat": 24.80, "lng": 85.01, "state": "Bihar"},
    "Muzaffarpur": {"lat": 26.12, "lng": 85.39, "state": "Bihar"},

    # Karnataka
    "Bengaluru Rural": {"lat": 13.23, "lng": 77.67, "state": "Karnataka"},
    "Mysuru": {"lat": 12.30, "lng": 76.66, "state": "Karnataka"},
    "Belagavi": {"lat": 15.85, "lng": 74.50, "state": "Karnataka"},

    # Gujarat
    "Anand": {"lat": 22.56, "lng": 72.93, "state": "Gujarat"},

    # Andhra Pradesh
    "Guntur": {"lat": 16.31, "lng": 80.44, "state": "Andhra Pradesh"},

    # West Bengal
    "Burdwan": {"lat": 23.23, "lng": 87.86, "state": "West Bengal"},

    # Rajasthan
    "Bhilwara": {"lat": 25.35, "lng": 74.63, "state": "Rajasthan"},

    # Kerala
    "Palakkad": {"lat": 10.78, "lng": 76.65, "state": "Kerala"},
}


def get_district_coords(district: str) -> dict:
    """Get coordinates for a district. Returns default coords if not found."""
    return DISTRICT_COORDINATES.get(district, {"lat": 23.0, "lng": 77.0, "state": "Unknown"})


# Valid Indian states and their districts (for validation)
VALID_STATES = list(set(d["state"] for d in DISTRICT_COORDINATES.values()))

DISTRICTS_BY_STATE = {}
for dist_name, info in DISTRICT_COORDINATES.items():
    state = info["state"]
    if state not in DISTRICTS_BY_STATE:
        DISTRICTS_BY_STATE[state] = []
    DISTRICTS_BY_STATE[state].append(dist_name)
