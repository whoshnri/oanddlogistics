"use client";

import { Circle, MapContainer, Polygon, TileLayer, Tooltip } from "react-leaflet";

import type { CoverageBoundary, CoverageStatus, LatLngPoint } from "@/lib/types";

interface CoverageMapProps {
  boundary: CoverageBoundary;
  point: LatLngPoint | null;
  postcodeLabel: string;
  status: CoverageStatus;
  zoom: number;
}

const STATUS_COLORS: Record<CoverageStatus, string> = {
  inside: "#16a34a",
  "near-boundary": "#f59e0b",
  outside: "#dc2626",
  error: "#64748b",
};

function getBoundaryCoordinates(boundary: CoverageBoundary): [number, number][] {
  return [
    [boundary.minLat, boundary.minLng],
    [boundary.minLat, boundary.maxLng],
    [boundary.maxLat, boundary.maxLng],
    [boundary.maxLat, boundary.minLng],
  ];
}

export function CoverageMap({
  boundary,
  point,
  postcodeLabel,
  status,
  zoom,
}: CoverageMapProps) {
  const boundaryCoordinates = getBoundaryCoordinates(boundary);
  const fallbackCenter: [number, number] = [
    (boundary.minLat + boundary.maxLat) / 2,
    (boundary.minLng + boundary.maxLng) / 2,
  ];
  const center: [number, number] = point ? [point.lat, point.lng] : fallbackCenter;
  const statusColor = STATUS_COLORS[status];

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon
          positions={boundaryCoordinates}
          pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.12, weight: 2 }}
        >
          <Tooltip sticky>Coverage boundary</Tooltip>
        </Polygon>

        {point ? (
          <>
            <Circle
              center={[point.lat, point.lng]}
              radius={1000}
              pathOptions={{
                color: statusColor,
                fillColor: statusColor,
                fillOpacity: 0.18,
                weight: 2,
              }}
            >
              <Tooltip sticky>{postcodeLabel}</Tooltip>
            </Circle>
            <Circle
              center={[point.lat, point.lng]}
              radius={55}
              pathOptions={{
                color: statusColor,
                fillColor: statusColor,
                fillOpacity: 0.95,
                weight: 1,
              }}
            />
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
