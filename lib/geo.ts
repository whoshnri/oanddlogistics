import type { CoverageBoundary, LatLngPoint } from "@/lib/types";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(a: LatLngPoint, b: LatLngPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const aa = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const cc = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return EARTH_RADIUS_KM * cc;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isPointInsideBoundary(
  point: LatLngPoint,
  boundary: CoverageBoundary,
): boolean {
  return (
    point.lat >= boundary.minLat &&
    point.lat <= boundary.maxLat &&
    point.lng >= boundary.minLng &&
    point.lng <= boundary.maxLng
  );
}

export function nearestDistanceToEdgeKm(
  point: LatLngPoint,
  boundary: CoverageBoundary,
): number {
  const candidatePoints: LatLngPoint[] = [
    { lat: boundary.minLat, lng: clamp(point.lng, boundary.minLng, boundary.maxLng) },
    { lat: boundary.maxLat, lng: clamp(point.lng, boundary.minLng, boundary.maxLng) },
    { lat: clamp(point.lat, boundary.minLat, boundary.maxLat), lng: boundary.minLng },
    { lat: clamp(point.lat, boundary.minLat, boundary.maxLat), lng: boundary.maxLng },
  ];

  return Math.min(
    ...candidatePoints.map((candidate) => haversineDistanceKm(point, candidate)),
  );
}

export function distanceToBoundaryKm(
  point: LatLngPoint,
  boundary: CoverageBoundary,
): number {
  const nearestPoint: LatLngPoint = {
    lat: clamp(point.lat, boundary.minLat, boundary.maxLat),
    lng: clamp(point.lng, boundary.minLng, boundary.maxLng),
  };

  return haversineDistanceKm(point, nearestPoint);
}
