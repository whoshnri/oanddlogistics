# O&D Logistics Coverage Checker

Simple Next.js (App Router + TypeScript) application for postcode coverage checks.

Users can enter a UK postcode and see:

1. whether the location is inside a square coverage boundary,
2. a map with the square boundary and resolved point,
3. a 1km circle around the resolved point,
4. quote/contact call-to-action buttons.

## Tech Stack

- Next.js App Router
- TypeScript
- React Leaflet / Leaflet map rendering
- Geocoding providers:
  - Primary: `postcodes.io`
  - Secondary: Google Geocoding API (if key is set), otherwise OSM Nominatim

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

3. Configure the variables in `.env.local`:

```env
COVERAGE_MIN_LAT=52.5061
COVERAGE_MAX_LAT=52.6752
COVERAGE_MIN_LNG=-0.4977
COVERAGE_MAX_LNG=-0.0128

NEXT_PUBLIC_COVERAGE_MIN_LAT=52.5061
NEXT_PUBLIC_COVERAGE_MAX_LAT=52.6752
NEXT_PUBLIC_COVERAGE_MIN_LNG=-0.4977
NEXT_PUBLIC_COVERAGE_MAX_LNG=-0.0128

MAX_GEOCODE_DEVIATION_KM=1
GOOGLE_GEOCODING_API_KEY=
NOMINATIM_USER_AGENT=oanddlogistics-coverage-app/1.0 (ops@oanddlogistics.co.uk)
NEXT_PUBLIC_DEFAULT_MAP_ZOOM=11
```

### Environment Variables

- `COVERAGE_MIN_LAT`, `COVERAGE_MAX_LAT`, `COVERAGE_MIN_LNG`, `COVERAGE_MAX_LNG`
  Server-side square coverage boundary used by `/api/coverage`.
- `NEXT_PUBLIC_COVERAGE_*`
  Public boundary values used for the initial client map render.
- `MAX_GEOCODE_DEVIATION_KM`
  Outlier threshold for provider disagreement. If secondary geocode is farther than this from primary, it is ignored.
- `GOOGLE_GEOCODING_API_KEY` (optional)
  If present, Google is used as the secondary provider.
- `NOMINATIM_USER_AGENT`
  User-Agent sent to Nominatim requests when Google key is absent.
- `NEXT_PUBLIC_DEFAULT_MAP_ZOOM`
  Default map zoom value.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## API

### `POST /api/coverage`

Request body:

```json
{
  "postcode": "SW1A 1AA"
}
```

Response (example):

```json
{
  "status": "inside",
  "insideBoundary": true,
  "input": {
    "rawPostcode": "SW1A 1AA",
    "normalizedPostcode": "SW1A 1AA"
  },
  "point": {
    "lat": 51.501009,
    "lng": -0.141588,
    "source": "primary"
  },
  "boundary": {
    "minLat": 52.5061,
    "maxLat": 52.6752,
    "minLng": -0.4977,
    "maxLng": -0.0128
  },
  "distances": {
    "nearestEdgeKm": 9.58,
    "distanceToBoundaryKm": 0,
    "signedDistanceToBoundaryKm": 9.58,
    "secondaryDeviationKm": 0.08
  },
  "diagnostics": {
    "maxGeocodeDeviationKm": 1,
    "nearBoundaryThresholdKm": 1,
    "secondaryIgnoredAsOutlier": false,
    "primary": {
      "provider": "postcodes.io",
      "usedForResolution": true,
      "lat": 51.501009,
      "lng": -0.141588,
      "error": null
    },
    "secondary": {
      "provider": "nominatim",
      "usedForResolution": false,
      "lat": 51.500909,
      "lng": -0.141488,
      "error": null
    }
  }
}
```

`status` values:
- `inside`
- `near-boundary`
- `outside`
- `error`

## Validation

```bash
npm run lint
npm run build
```
