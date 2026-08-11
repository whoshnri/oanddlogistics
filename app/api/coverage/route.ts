import { NextResponse } from "next/server";

import {
  DEFAULT_NEAR_BOUNDARY_THRESHOLD_KM,
  getMaxGeocodeDeviationKm,
  getServerCoverageBoundary,
} from "@/lib/config";
import {
  distanceToBoundaryKm,
  haversineDistanceKm,
  isPointInsideBoundary,
  nearestDistanceToEdgeKm,
} from "@/lib/geo";
import { normalizeUkPostcode } from "@/lib/postcode";
import type { CoverageApiResponse, GeocodeDiagnosticEntry, LatLngPoint } from "@/lib/types";

type GeocodeProvider = "postcodes.io" | "google" | "nominatim";

interface GeocodeResult {
  provider: GeocodeProvider;
  point: LatLngPoint;
}

async function geocodeWithPostcodesIo(postcode: string): Promise<GeocodeResult | null> {
  const response = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    status?: number;
    result?: { latitude?: number; longitude?: number };
  };

  if (payload.status !== 200 || !payload.result) {
    return null;
  }

  const { latitude, longitude } = payload.result;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  return {
    provider: "postcodes.io",
    point: { lat: latitude, lng: longitude },
  };
}

async function geocodeWithGoogle(postcode: string, apiKey: string): Promise<GeocodeResult | null> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      `${postcode}, UK`,
    )}&key=${encodeURIComponent(apiKey)}`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    status?: string;
    results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>;
  };

  if (payload.status !== "OK" || !payload.results || payload.results.length === 0) {
    return null;
  }

  const location = payload.results[0]?.geometry?.location;
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return null;
  }

  return {
    provider: "google",
    point: { lat: location.lat, lng: location.lng },
  };
}

async function geocodeWithNominatim(postcode: string): Promise<GeocodeResult | null> {
  const userAgent =
    process.env.NOMINATIM_USER_AGENT ?? "oanddlogistics-coverage-app/1.0 (contact@example.com)";

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=gb&limit=1&q=${encodeURIComponent(
      postcode,
    )}`,
    {
      headers: {
        "User-Agent": userAgent,
        "Accept-Language": "en-GB,en;q=0.8",
      },
      next: { revalidate: 0 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>;
  const match = payload[0];
  if (!match?.lat || !match?.lon) {
    return null;
  }

  const lat = Number(match.lat);
  const lng = Number(match.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    provider: "nominatim",
    point: { lat, lng },
  };
}

async function geocodeWithSecondaryProvider(postcode: string): Promise<GeocodeResult | null> {
  const googleApiKey = process.env.GOOGLE_GEOCODING_API_KEY?.trim();
  if (googleApiKey) {
    return geocodeWithGoogle(postcode, googleApiKey);
  }

  return geocodeWithNominatim(postcode);
}

function makeGeocodeDiagnostic(
  provider: GeocodeProvider,
  result: GeocodeResult | null,
  usedForResolution: boolean,
  error: string | null,
): GeocodeDiagnosticEntry {
  return {
    provider,
    usedForResolution,
    lat: result?.point.lat ?? null,
    lng: result?.point.lng ?? null,
    error,
  };
}

function buildErrorResponse(
  rawPostcode: string,
  normalizedPostcode: string,
  message: string,
  maxGeocodeDeviationKm: number,
): CoverageApiResponse {
  return {
    status: "error",
    insideBoundary: false,
    input: { rawPostcode, normalizedPostcode },
    point: null,
    boundary: { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 },
    distances: {
      nearestEdgeKm: null,
      distanceToBoundaryKm: null,
      signedDistanceToBoundaryKm: null,
      secondaryDeviationKm: null,
    },
    diagnostics: {
      maxGeocodeDeviationKm,
      nearBoundaryThresholdKm: DEFAULT_NEAR_BOUNDARY_THRESHOLD_KM,
      secondaryIgnoredAsOutlier: false,
      primary: makeGeocodeDiagnostic("postcodes.io", null, false, null),
      secondary: null,
    },
    message,
  };
}

export async function POST(request: Request) {
  const maxGeocodeDeviationKm = getMaxGeocodeDeviationKm();
  const rawPayload = (await request.json().catch(() => null)) as
    | { postcode?: unknown }
    | null;
  const rawPostcode =
    rawPayload && typeof rawPayload.postcode === "string" ? rawPayload.postcode : "";

  const normalizedPostcode = normalizeUkPostcode(rawPostcode);
  if (!normalizedPostcode) {
    return NextResponse.json(
      buildErrorResponse(
        rawPostcode,
        "",
        "Please provide a valid UK postcode.",
        maxGeocodeDeviationKm,
      ),
      { status: 400 },
    );
  }

  try {
    const boundary = getServerCoverageBoundary();

    const primaryResult = await geocodeWithPostcodesIo(normalizedPostcode);
    const secondaryResult = await geocodeWithSecondaryProvider(normalizedPostcode);

    const secondaryDeviationKm =
      primaryResult && secondaryResult
        ? haversineDistanceKm(primaryResult.point, secondaryResult.point)
        : null;
    const secondaryIgnoredAsOutlier =
      secondaryDeviationKm !== null && secondaryDeviationKm > maxGeocodeDeviationKm;

    const resolved =
      primaryResult ??
      (secondaryResult && !secondaryIgnoredAsOutlier ? secondaryResult : null);

    if (!resolved) {
      const response: CoverageApiResponse = {
        ...buildErrorResponse(
          rawPostcode,
          normalizedPostcode,
          "Unable to geocode postcode with available providers.",
          maxGeocodeDeviationKm,
        ),
        boundary,
        diagnostics: {
          maxGeocodeDeviationKm,
          nearBoundaryThresholdKm: DEFAULT_NEAR_BOUNDARY_THRESHOLD_KM,
          secondaryIgnoredAsOutlier,
          primary: makeGeocodeDiagnostic("postcodes.io", primaryResult, false, null),
          secondary: secondaryResult
            ? makeGeocodeDiagnostic(
                secondaryResult.provider,
                secondaryResult,
                false,
                secondaryIgnoredAsOutlier
                  ? "Ignored because it deviates from primary provider."
                  : null,
              )
            : makeGeocodeDiagnostic(
                process.env.GOOGLE_GEOCODING_API_KEY ? "google" : "nominatim",
                null,
                false,
                "No result from secondary provider.",
              ),
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    const insideBoundary = isPointInsideBoundary(resolved.point, boundary);
    const nearestEdgeKm = nearestDistanceToEdgeKm(resolved.point, boundary);
    const outsideDistanceKm = insideBoundary
      ? 0
      : distanceToBoundaryKm(resolved.point, boundary);
    const signedDistanceToBoundaryKm = insideBoundary
      ? nearestEdgeKm
      : outsideDistanceKm * -1;

    const status = insideBoundary
      ? nearestEdgeKm <= DEFAULT_NEAR_BOUNDARY_THRESHOLD_KM
        ? "near-boundary"
        : "inside"
      : "outside";

    const response: CoverageApiResponse = {
      status,
      insideBoundary,
      input: {
        rawPostcode,
        normalizedPostcode,
      },
      point: {
        ...resolved.point,
        source: resolved.provider === "postcodes.io" ? "primary" : "secondary",
      },
      boundary,
      distances: {
        nearestEdgeKm,
        distanceToBoundaryKm: outsideDistanceKm,
        signedDistanceToBoundaryKm,
        secondaryDeviationKm,
      },
      diagnostics: {
        maxGeocodeDeviationKm,
        nearBoundaryThresholdKm: DEFAULT_NEAR_BOUNDARY_THRESHOLD_KM,
        secondaryIgnoredAsOutlier,
        primary: makeGeocodeDiagnostic(
          "postcodes.io",
          primaryResult,
          resolved.provider === "postcodes.io",
          primaryResult ? null : "No result from primary provider.",
        ),
        secondary: secondaryResult
          ? makeGeocodeDiagnostic(
              secondaryResult.provider,
              secondaryResult,
              resolved.provider === secondaryResult.provider,
              secondaryIgnoredAsOutlier
                ? "Ignored because it deviates from primary provider."
                : null,
            )
          : makeGeocodeDiagnostic(
              process.env.GOOGLE_GEOCODING_API_KEY ? "google" : "nominatim",
              null,
              false,
              "No result from secondary provider.",
            ),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json(
      buildErrorResponse(rawPostcode, normalizedPostcode, message, maxGeocodeDeviationKm),
      { status: 500 },
    );
  }
}
