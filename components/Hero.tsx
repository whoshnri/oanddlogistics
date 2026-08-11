"use client";

import { useState } from "react";

import { CoverageModal } from "@/components/CoverageModal";
import type { CoverageBoundary } from "@/lib/types";

const QUOTE_HREF = "mailto:quotes@oanddlogistics.co.uk?subject=Quote%20Request";

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="route-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0H0V56" fill="none" stroke="#12100c" strokeWidth="1" opacity="0.08" />
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#route-grid)" />
        <circle cx="1120" cy="220" r="150" fill="#f3e9c8" opacity="0.28" className="animate-soft-pulse" />
        <path
          d="M-20 640 C280 480, 420 720, 720 540 S1100 420, 1480 520"
          fill="none"
          stroke="#12100c"
          strokeWidth="3"
          strokeDasharray="12 14"
          opacity="0.2"
        />
        <g transform="translate(980 520)" className="animate-rise-delay-2">
          <rect x="0" y="36" width="200" height="68" rx="12" fill="#12100c" />
          <rect x="142" y="14" width="58" height="48" rx="10" fill="#2a2418" />
          <rect x="154" y="24" width="32" height="26" rx="4" fill="#e8d49a" />
          <rect x="18" y="50" width="104" height="40" rx="8" fill="#c4a04a" />
          <text
            x="70"
            y="76"
            textAnchor="middle"
            fill="#12100c"
            fontSize="18"
            fontWeight="700"
            fontFamily="var(--font-body-family), sans-serif"
          >
            O&amp;D
          </text>
          <circle cx="42" cy="112" r="18" fill="#2a2418" />
          <circle cx="42" cy="112" r="8" fill="#e8d49a" />
          <circle cx="164" cy="112" r="18" fill="#2a2418" />
          <circle cx="164" cy="112" r="8" fill="#e8d49a" />
          <g transform="translate(220 0)">
            <rect x="0" y="0" width="40" height="32" rx="7" fill="#12100c" />
            <rect x="7" y="7" width="26" height="12" rx="2" fill="#e8d49a" />
          </g>
        </g>
      </svg>
    </div>
  );
}

interface HeroProps {
  initialBoundary: CoverageBoundary;
}

export function Hero({ initialBoundary }: HeroProps) {
  const [coverageOpen, setCoverageOpen] = useState(false);

  return (
    <>
      <section className="hero-grain relative flex min-h-svh flex-col overflow-hidden">
        <HeroBackdrop />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-16 md:px-8 md:py-20">
          <p className="animate-rise font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-8xl">
            O&amp;D Logistics
          </p>
          <h1 className="animate-rise-delay-1 mt-6 max-w-xl font-display text-2xl font-medium leading-snug text-ink-soft sm:text-3xl">
            Same-day local delivery, done with a smile
          </h1>
          <p className="animate-rise-delay-2 mt-4 max-w-md text-lg leading-relaxed text-ink-muted">
            Friendly courier support for businesses who need parcels, food, and retail drops moved
            quickly — without the fuss.
          </p>
          <div className="animate-rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <a
              href={QUOTE_HREF}
              className="inline-flex items-center rounded-xl bg-ink px-6 py-3.5 text-base font-bold text-mustard-pale transition hover:bg-ink-soft"
            >
              Get a quote
            </a>
            <button
              type="button"
              onClick={() => setCoverageOpen(true)}
              className="inline-flex items-center rounded-xl border border-ink/25 bg-transparent px-5 py-3.5 text-base font-semibold text-ink transition hover:bg-ink/5"
            >
              Check coverage
            </button>
          </div>
        </div>
      </section>

      <CoverageModal
        open={coverageOpen}
        onClose={() => setCoverageOpen(false)}
        initialBoundary={initialBoundary}
      />
    </>
  );
}
