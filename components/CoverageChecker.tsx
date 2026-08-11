"use client";

import dynamic from "next/dynamic";
import { FormEvent, useMemo, useState } from "react";

import type { CoverageApiResponse, CoverageBoundary, CoverageStatus } from "@/lib/types";

const CoverageMap = dynamic(
  () => import("@/components/CoverageMap").then((module) => module.CoverageMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
    ),
  },
);

const STATUS_BADGE: Record<CoverageStatus, { label: string; classes: string }> = {
  inside: {
    label: "Inside coverage",
    classes: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  "near-boundary": {
    label: "Near boundary",
    classes: "bg-amber-100 text-amber-800 border-amber-200",
  },
  outside: {
    label: "Outside coverage",
    classes: "bg-rose-100 text-rose-800 border-rose-200",
  },
  error: {
    label: "Unable to resolve",
    classes: "bg-slate-100 text-slate-800 border-slate-200",
  },
};

const STATUS_COPY: Record<CoverageStatus, string> = {
  inside: "This postcode sits comfortably inside our active area.",
  "near-boundary": "This postcode is near our boundary. Our team will confirm route timing.",
  outside: "This postcode is outside our current square area.",
  error: "Enter a valid UK postcode to check coverage.",
};

interface CoverageCheckerProps {
  initialBoundary: CoverageBoundary;
  defaultMapZoom: number;
}

export function CoverageChecker({ initialBoundary, defaultMapZoom }: CoverageCheckerProps) {
  const [postcode, setPostcode] = useState("");
  const [response, setResponse] = useState<CoverageApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const resolvedBoundary = response?.boundary ?? initialBoundary;
  const status = response?.status ?? "error";
  const statusBadge = STATUS_BADGE[status];
  const statusCopy = STATUS_COPY[status];

  const nearestEdgeText = useMemo(() => {
    if (response?.distances.nearestEdgeKm === null || response?.distances.nearestEdgeKm === undefined) {
      return "—";
    }

    return `${response.distances.nearestEdgeKm.toFixed(2)} km`;
  }, [response]);

  const boundaryDistanceText = useMemo(() => {
    if (
      response?.distances.distanceToBoundaryKm === null ||
      response?.distances.distanceToBoundaryKm === undefined
    ) {
      return "—";
    }

    return `${response.distances.distanceToBoundaryKm.toFixed(2)} km`;
  }, [response]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setRequestError(null);

    try {
      const apiResponse = await fetch("/api/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode }),
      });

      const payload = (await apiResponse.json()) as CoverageApiResponse;
      setResponse(payload);
    } catch {
      setRequestError("We could not reach the coverage API. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <p className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-900">
        PHASE 1
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <h1 className="text-3xl font-semibold text-slate-900">O&amp;D Logistics</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Same-day local courier support for businesses. Check postcode coverage and request a
            quote in under a minute.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span> Same day delivery
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span> Local courier
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span> Business account options
            </li>
          </ul>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="postcode" className="sr-only">
              UK postcode
            </label>
            <input
              id="postcode"
              name="postcode"
              type="text"
              autoComplete="postal-code"
              placeholder="Enter UK postcode (e.g. SW1A 1AA)"
              value={postcode}
              onChange={(event) => setPostcode(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none ring-blue-100 transition focus:border-blue-500 focus:ring sm:max-w-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Checking..." : "Check postcode"}
            </button>
          </form>

          {requestError ? <p className="mt-3 text-sm text-rose-600">{requestError}</p> : null}
          {response?.message ? <p className="mt-3 text-sm text-rose-600">{response.message}</p> : null}

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-sm font-medium ${statusBadge.classes}`}
              >
                {statusBadge.label}
              </span>
              {response?.point ? (
                <span className="text-sm text-slate-600">
                  {response.input.normalizedPostcode}: {response.point.lat.toFixed(5)},{" "}
                  {response.point.lng.toFixed(5)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-600">{statusCopy}</p>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-900">Nearest edge</p>
              <p>{nearestEdgeText}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-900">Distance to boundary</p>
              <p>{boundaryDistanceText}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-900">Secondary deviation</p>
              <p>
                {response?.distances.secondaryDeviationKm !== null &&
                response?.distances.secondaryDeviationKm !== undefined
                  ? `${response.distances.secondaryDeviationKm.toFixed(2)} km`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:quotes@oanddlogistics.co.uk?subject=Quote%20Request"
              className="inline-flex items-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Get a quote
            </a>
            <a
              href="https://wa.me/441234567890"
              className="inline-flex items-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              WhatsApp
            </a>
            <a
              href="tel:+441234567890"
              className="inline-flex items-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              01234 567890
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Coverage Map</h2>
              <p className="text-sm text-slate-600">Square boundary + 1km radius from postcode point</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Inside
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Near edge
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Outside
              </span>
            </div>
          </div>

          <CoverageMap
            boundary={resolvedBoundary}
            point={response?.point ?? null}
            postcodeLabel={response?.input.normalizedPostcode ?? "Resolved point"}
            status={status}
            zoom={defaultMapZoom}
          />
        </section>
      </div>
    </div>
  );
}
