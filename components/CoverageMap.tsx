"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { CoverageBoundary, CoverageStatus, LatLngPoint } from "@/lib/types";

interface CoverageMapProps {
  boundary: CoverageBoundary;
  point: LatLngPoint | null;
  status: CoverageStatus;
  zoom?: number;
}

const STATUS_COLORS: Record<CoverageStatus, string> = {
  inside: "#1d4ed8",
  "near-boundary": "#1d4ed8",
  outside: "#b45309",
  error: "#1d4ed8",
};

function getBoundaryCoordinates(boundary: CoverageBoundary): [number, number][] {
  return [
    [boundary.minLat, boundary.minLng],
    [boundary.minLat, boundary.maxLng],
    [boundary.maxLat, boundary.maxLng],
    [boundary.maxLat, boundary.minLng],
  ];
}

function FitBounds({
  boundary,
  point,
}: {
  boundary: CoverageBoundary;
  point: LatLngPoint | null;
}) {
  const map = useMap();

  useEffect(() => {
    const corners: [number, number][] = getBoundaryCoordinates(boundary);
    if (point) {
      corners.push([point.lat, point.lng]);
    }
    map.fitBounds(corners, { padding: [28, 28], maxZoom: 13 });
  }, [boundary, point, map]);

  return null;
}

export function CoverageMap({
  boundary,
  point,
  status,
  zoom = 11,
}: CoverageMapProps) {
  const boundaryCoordinates = getBoundaryCoordinates(boundary);
  const center: [number, number] = point
    ? [point.lat, point.lng]
    : [
        (boundary.minLat + boundary.maxLat) / 2,
        (boundary.minLng + boundary.maxLng) / 2,
      ];
  const pinColor = STATUS_COLORS[status];

  return (
    <div className="coverage-map h-[280px] w-full overflow-hidden md:h-[320px]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds boundary={boundary} point={point} />

        <Polygon
          positions={boundaryCoordinates}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#2563eb",
            fillOpacity: 0.08,
            weight: 3,
          }}
        />

        {point ? (
          <CircleMarker
            center={[point.lat, point.lng]}
            radius={8}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: pinColor,
              fillOpacity: 1,
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
