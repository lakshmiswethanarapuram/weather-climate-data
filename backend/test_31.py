import urllib.request, json
try:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/store-weather-data",
        data=json.dumps({
            "latitude": 17.385,
            "longitude": 78.4867,
            "start_date": "2026-07-01",
            "end_date": "2026-07-31"
        }).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        print(resp.read().decode())
except Exception as e:
    print(f"ERROR: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode())
