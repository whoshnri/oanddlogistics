"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CoverageChecker } from "@/components/CoverageChecker";
import type { CoverageBoundary } from "@/lib/types";

interface CoverageModalProps {
  open: boolean;
  onClose: () => void;
  initialBoundary: CoverageBoundary;
  initialPostcode?: string;
}

export function CoverageModal({
  open,
  onClose,
  initialBoundary,
  initialPostcode = "",
}: CoverageModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [backdropArmed, setBackdropArmed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setBackdropArmed(false);
      return;
    }

    // Avoid the opening tap/click immediately hitting the backdrop and closing the sheet.
    const armTimer = window.setTimeout(() => setBackdropArmed(true), 350);
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(armTimer);
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-6">
      <button
        type="button"
        aria-label="Close coverage checker"
        className="absolute inset-0 bg-ink/45 transition"
        onClick={() => {
          if (backdropArmed) onClose();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92svh] w-full translate-y-0 flex-col overflow-hidden rounded-t-3xl border border-ink/10 bg-mustard opacity-100 shadow-[0_-12px_40px_rgba(18,16,12,0.25)] animate-sheet-in md:max-h-[min(860px,90vh)] md:max-w-4xl md:animate-modal-in md:rounded-3xl md:shadow-[0_24px_60px_rgba(18,16,12,0.28)]"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-ink/10 px-5 pb-4 pt-3 md:px-6 md:pt-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/20 md:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p id={titleId} className="font-display text-2xl font-semibold tracking-tight text-ink">
                Coverage result
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {initialPostcode.trim() || "Your delivery coverage"}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink/15 bg-cream/70 px-3 py-2 text-sm font-bold text-ink transition hover:bg-cream"
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5 md:px-6 md:py-6">
          <CoverageChecker
            key={initialPostcode || "empty"}
            initialBoundary={initialBoundary}
            initialPostcode={initialPostcode}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
