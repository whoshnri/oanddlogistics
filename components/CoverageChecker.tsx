"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { CoverageApiResponse, CoverageBoundary, CoverageStatus } from "@/lib/types";

const CoverageMap = dynamic(
  () => import("@/components/CoverageMap").then((module) => module.CoverageMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full animate-pulse bg-ink/10 md:h-[320px]" />
    ),
  },
);

const QUOTE_HREF = "mailto:quotes@oanddlogistics.co.uk?subject=Quote%20Request";
const CONTACT_HREF = "https://wa.me/441234567890";

const STATUS_COPY: Record<
  CoverageStatus,
  { title: string; body: string; panel: string }
> = {
  inside: {
    title: "You're covered",
    body: "Great news, we deliver to this postcode. Request a quote and we'll take it from there.",
    panel: "border-success/25 bg-success-bg text-success",
  },
  "near-boundary": {
    title: "You're covered, near the edge",
    body: "You're inside our area, close to the boundary. We'll confirm the best route timing when you get in touch.",
    panel: "border-caution/30 bg-caution-bg text-caution",
  },
  outside: {
    title: "Just outside our area",
    body: "Here's the nearest zone on the map. Get in touch and we'll see what we can do for you.",
    panel: "border-outside/25 bg-outside-bg text-outside",
  },
  error: {
    title: "Let's try that again",
    body: "We couldn't check that postcode. Close this and try another one.",
    panel: "border-ink/15 bg-cream/60 text-ink-muted",
  },
};

interface CoverageCheckerProps {
  initialBoundary: CoverageBoundary;
  initialPostcode?: string;
}

async function fetchCoverage(postcode: string): Promise<CoverageApiResponse> {
  const apiResponse = await fetch("/api/coverage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcode }),
  });

  return (await apiResponse.json()) as CoverageApiResponse;
}

function CoverageLoading({ postcode }: { postcode: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-10 text-center md:min-h-[320px]">
      <div className="relative mb-8 h-28 w-28" aria-hidden>
        <span className="absolute inset-0 rounded-full border border-ink/10 bg-cream/50" />
        <span className="coverage-loader-ring absolute inset-2 rounded-full border-2 border-transparent border-t-ink border-r-ink/30" />
        <span className="coverage-loader-ping absolute inset-5 rounded-full bg-mustard-soft/80" />
        <span className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-ink" fill="currentColor">
            <path d="M12 2c-3.3 0-6 2.6-6 5.8 0 4.4 6 11.2 6 11.2s6-6.8 6-11.2C18 4.6 15.3 2 12 2zm0 8.2a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8z" />
          </svg>
        </span>
      </div>

      <p className="font-display text-2xl font-semibold tracking-tight text-ink">
        Checking coverage
      </p>
      {postcode ? (
        <p className="mt-2 text-sm font-semibold text-ink-soft">{postcode}</p>
      ) : null}
      <p className="mt-2 max-w-xs text-sm text-ink-muted">
        Looking up your postcode against our delivery zone…
      </p>
    </div>
  );
}

export function CoverageChecker({
  initialBoundary,
  initialPostcode = "",
}: CoverageCheckerProps) {
  const [response, setResponse] = useState<CoverageApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialPostcode.trim()));
  const [requestError, setRequestError] = useState<string | null>(null);
  const checkedRef = useRef(false);

  const resolvedBoundary = response?.boundary ?? initialBoundary;
  const status = response?.status ?? "error";
  const copy = STATUS_COPY[status];
  const hasResult = Boolean(response);
  const mapUnavailable = Boolean(requestError) || (hasResult && status === "error");

  const runCheck = async (value: string) => {
    const postcode = value.trim();
    if (!postcode) return;

    setIsLoading(true);
    setRequestError(null);
    setResponse(null);

    try {
      const payload = await fetchCoverage(postcode);
      setResponse(payload);
    } catch {
      setRequestError("Something went wrong on our side. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const value = initialPostcode.trim();
    if (!value || checkedRef.current) {
      if (!value) setIsLoading(false);
      return;
    }

    checkedRef.current = true;
    void runCheck(value);
  }, [initialPostcode]);

  if (isLoading) {
    return <CoverageLoading postcode={initialPostcode.trim()} />;
  }

  if (!initialPostcode.trim() && !hasResult) {
    return (
      <div className={`rounded-2xl border p-5 ${STATUS_COPY.error.panel}`}>
        <p className="font-display text-2xl font-semibold tracking-tight">
          {STATUS_COPY.error.title}
        </p>
        <p className="mt-2 text-base leading-relaxed opacity-90">
          Enter a postcode on the page first, then send it through.
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-[1fr_1fr]">
      <div>
        {requestError ? <p className="mb-3 text-sm text-outside">{requestError}</p> : null}

        {hasResult ? (
          <div className={`rounded-2xl border p-5 animate-rise ${copy.panel}`}>
            <p className="font-display text-2xl font-semibold tracking-tight">{copy.title}</p>
            {response?.input.normalizedPostcode ? (
              <p className="mt-1 text-sm font-semibold opacity-80">
                {response.input.normalizedPostcode}
              </p>
            ) : null}
            <p className="mt-2 text-base leading-relaxed opacity-90">
              {response?.message && status === "error" ? response.message : copy.body}
            </p>

            {(status === "inside" || status === "near-boundary") && (
              <a
                href={QUOTE_HREF}
                className="mt-4 inline-flex items-center rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-mustard-pale transition hover:bg-ink-soft"
              >
                Get a quote
              </a>
            )}
            {status === "outside" && (
              <a
                href={CONTACT_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center rounded-xl border border-current/30 bg-cream/50 px-5 py-2.5 text-sm font-bold transition hover:bg-cream"
              >
                Talk to us anyway
              </a>
            )}
          </div>
        ) : null}
      </div>

      {hasResult && status !== "error" ? (
        <CoverageMap
          boundary={resolvedBoundary}
          point={response?.point ?? null}
          status={status}
        />
      ) : mapUnavailable ? (
        <div className="flex h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-ink/10 bg-cream/40 px-6 text-center md:h-[320px]">
          <p className="text-sm text-ink-muted">Map unavailable for this result</p>
          <button
            type="button"
            onClick={() => void runCheck(initialPostcode)}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-mustard-pale transition hover:bg-ink-soft"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}
