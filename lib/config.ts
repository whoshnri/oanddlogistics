import type { CoverageBoundary } from "@/lib/types";

const DEFAULT_MAX_GEOCODE_DEVIATION_KM = 1;
export const DEFAULT_NEAR_BOUNDARY_THRESHOLD_KM = 1;
export const DEFAULT_PUBLIC_MAP_ZOOM = 11;
const DEFAULT_PUBLIC_BOUNDARY: CoverageBoundary = {
  minLat: 51.3,
  maxLat: 51.7,
  minLng: -0.5,
  maxLng: 0.3,
};

function parseRequiredNumber(name: string, raw: string | undefined): number {
  if (raw === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return parsed;
}

function parseOptionalNumber(raw: string | undefined, fallback: number): number {
  if (raw === undefined) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validateBoundary(boundary: CoverageBoundary): CoverageBoundary {
  if (boundary.minLat >= boundary.maxLat) {
    throw new Error("COVERAGE_MIN_LAT must be lower than COVERAGE_MAX_LAT");
  }

  if (boundary.minLng >= boundary.maxLng) {
    throw new Error("COVERAGE_MIN_LNG must be lower than COVERAGE_MAX_LNG");
  }

  return boundary;
}

export function getServerCoverageBoundary(): CoverageBoundary {
  return validateBoundary({
    minLat: parseRequiredNumber("COVERAGE_MIN_LAT", process.env.COVERAGE_MIN_LAT),
    maxLat: parseRequiredNumber("COVERAGE_MAX_LAT", process.env.COVERAGE_MAX_LAT),
    minLng: parseRequiredNumber("COVERAGE_MIN_LNG", process.env.COVERAGE_MIN_LNG),
    maxLng: parseRequiredNumber("COVERAGE_MAX_LNG", process.env.COVERAGE_MAX_LNG),
  });
}

export function getPublicCoverageBoundary(): CoverageBoundary {
  return validateBoundary({
    minLat: parseOptionalNumber(
      process.env.NEXT_PUBLIC_COVERAGE_MIN_LAT ?? process.env.COVERAGE_MIN_LAT,
      DEFAULT_PUBLIC_BOUNDARY.minLat,
    ),
    maxLat: parseOptionalNumber(
      process.env.NEXT_PUBLIC_COVERAGE_MAX_LAT ?? process.env.COVERAGE_MAX_LAT,
      DEFAULT_PUBLIC_BOUNDARY.maxLat,
    ),
    minLng: parseOptionalNumber(
      process.env.NEXT_PUBLIC_COVERAGE_MIN_LNG ?? process.env.COVERAGE_MIN_LNG,
      DEFAULT_PUBLIC_BOUNDARY.minLng,
    ),
    maxLng: parseOptionalNumber(
      process.env.NEXT_PUBLIC_COVERAGE_MAX_LNG ?? process.env.COVERAGE_MAX_LNG,
      DEFAULT_PUBLIC_BOUNDARY.maxLng,
    ),
  });
}

export function getMaxGeocodeDeviationKm(): number {
  return parseOptionalNumber(
    process.env.MAX_GEOCODE_DEVIATION_KM,
    DEFAULT_MAX_GEOCODE_DEVIATION_KM,
  );
}

export function getPublicDefaultMapZoom(): number {
  return parseOptionalNumber(
    process.env.NEXT_PUBLIC_DEFAULT_MAP_ZOOM,
    DEFAULT_PUBLIC_MAP_ZOOM,
  );
}
