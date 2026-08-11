"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";

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
    body: "Great news — we deliver to this postcode. Request a quote and we'll take it from there.",
    panel: "border-success/25 bg-success-bg text-success",
  },
  "near-boundary": {
    title: "You're covered — near the edge",
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
    body: "Enter a valid UK postcode and we'll check if we can deliver to you.",
    panel: "border-ink/15 bg-cream/60 text-ink-muted",
  },
};

interface CoverageCheckerProps {
  initialBoundary: CoverageBoundary;
  compact?: boolean;
}

export function CoverageChecker({ initialBoundary, compact = false }: CoverageCheckerProps) {
  const [postcode, setPostcode] = useState("");
  const [response, setResponse] = useState<CoverageApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const resolvedBoundary = response?.boundary ?? initialBoundary;
  const status = response?.status ?? "error";
  const copy = STATUS_COPY[status];
  const hasResult = Boolean(response);

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
      setRequestError("Something went wrong on our side. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        compact
          ? "grid items-start gap-6 md:grid-cols-[1fr_1fr]"
          : "grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]"
      }
    >
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="postcode" className="sr-only">
            UK postcode
          </label>
          <input
            id="postcode"
            name="postcode"
            type="text"
            autoComplete="postal-code"
            placeholder="e.g. SW1A 1AA"
            value={postcode}
            onChange={(event) => setPostcode(event.target.value)}
            className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-3.5 text-ink shadow-none outline-none transition placeholder:text-ink-muted/70 focus:border-ink focus:ring-2 focus:ring-ink/15"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl border border-ink/20 bg-surface px-5 py-3.5 font-bold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Checking…" : "Check coverage"}
          </button>
        </form>

        {requestError ? <p className="mt-3 text-sm text-outside">{requestError}</p> : null}
        {response?.message && status === "error" ? (
          <p className="mt-3 text-sm text-outside">{response.message}</p>
        ) : null}

        {hasResult ? (
          <div className={`mt-5 rounded-2xl border p-5 animate-rise ${copy.panel}`}>
            <p className="font-display text-2xl font-semibold tracking-tight">{copy.title}</p>
            {response?.input.normalizedPostcode ? (
              <p className="mt-1 text-sm font-semibold opacity-80">
                {response.input.normalizedPostcode}
              </p>
            ) : null}
            <p className="mt-2 text-base leading-relaxed opacity-90">{copy.body}</p>

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
        ) : (
          <p className="mt-4 text-sm text-ink-muted">
            Pop in your postcode and we&apos;ll tell you straight away if we cover it.
          </p>
        )}
      </div>

      <CoverageMap
        boundary={resolvedBoundary}
        point={response?.point ?? null}
        status={hasResult ? status : "error"}
      />
    </div>
  );
}
