export type CoverageStatus = "inside" | "near-boundary" | "outside" | "error";

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface CoverageBoundary {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface GeocodeDiagnosticEntry {
  provider: "postcodes.io" | "google" | "nominatim";
  usedForResolution: boolean;
  lat: number | null;
  lng: number | null;
  error: string | null;
}

export interface CoverageApiResponse {
  status: CoverageStatus;
  insideBoundary: boolean;
  input: {
    rawPostcode: string;
    normalizedPostcode: string;
  };
  point: (LatLngPoint & { source: "primary" | "secondary" }) | null;
  boundary: CoverageBoundary;
  distances: {
    nearestEdgeKm: number | null;
    distanceToBoundaryKm: number | null;
    signedDistanceToBoundaryKm: number | null;
    secondaryDeviationKm: number | null;
  };
  diagnostics: {
    maxGeocodeDeviationKm: number;
    nearBoundaryThresholdKm: number;
    secondaryIgnoredAsOutlier: boolean;
    primary: GeocodeDiagnosticEntry;
    secondary: GeocodeDiagnosticEntry | null;
  };
  message?: string;
}
