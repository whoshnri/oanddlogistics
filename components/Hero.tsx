"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { FaEnvelope, FaPhone, FaWhatsapp } from "react-icons/fa6";

import { CoverageModal } from "@/components/CoverageModal";
import type { CoverageBoundary } from "@/lib/types";

const EMAIL_HREF = "mailto:quotes@oanddlogistics.co.uk?subject=Quote%20Request";
const PHONE_DISPLAY = "01234 567890";
const PHONE_HREF = "tel:+441234567890";
const WHATSAPP_MESSAGE =
  "Hi O&D Logistics, I'd like a quick inquiry about same-day delivery / courier services.";
const WHATSAPP_HREF = `https://wa.me/441234567890?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

interface HeroProps {
  initialBoundary: CoverageBoundary;
}

export function Hero({ initialBoundary }: HeroProps) {
  const [postcode, setPostcode] = useState("");
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [submittedPostcode, setSubmittedPostcode] = useState("");

  const openCoverage = (value: string) => {
    setSubmittedPostcode(value.trim());
    setCoverageOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    openCoverage(postcode);
  };

  return (
    <>
      <section className="hero-grain relative flex min-h-svh flex-col overflow-hidden">
        <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 content-center items-center gap-6 px-5 py-10 sm:gap-8 sm:py-12 md:grid-cols-[0.9fr_1.1fr] md:gap-x-8 md:gap-y-4 md:px-8 md:py-16 lg:gap-x-12">
          <p className="animate-rise font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:col-start-1 md:row-start-1 md:self-end md:text-6xl">
            O&amp;D Logistics
          </p>

          <div className="animate-rise-delay-1 relative mx-auto flex w-full max-w-sm items-center justify-center sm:max-w-md md:col-start-2 md:row-span-2 md:row-start-1 md:mx-0 md:max-w-none md:justify-end md:self-center">
            <Image
              src="/heroimage.png"
              alt="O&D Logistics courier on a gold scooter with delivery box"
              width={1024}
              height={1024}
              priority
              className="h-auto w-full max-h-[min(42svh,360px)] object-contain object-center mix-blend-lighten sm:max-h-[min(48svh,440px)] md:max-h-[min(82svh,720px)] md:w-[min(100%,680px)] md:origin-right md:scale-105 lg:scale-110"
              sizes="(max-width: 768px) 85vw, 50vw"
            />
          </div>

          <div className="animate-rise-delay-2 md:col-start-1 md:row-start-2 md:self-start">
            <p className="max-w-md font-display text-xl font-medium leading-snug text-ink-soft sm:text-2xl md:text-[1.85rem] md:leading-[1.25]">
              Same day delivery, local courier, business accounts, and food &amp; parcel delivery.
            </p>

            <div className="mt-8 max-w-md">
              <p className="text-sm font-semibold text-ink sm:text-base">
                Check if your delivery is in our coverage area
              </p>
              <form onSubmit={handleSubmit} className="mt-2.5 flex items-center gap-1.5">
                <label htmlFor="hero-postcode" className="sr-only">
                  UK postcode
                </label>
                <input
                  id="hero-postcode"
                  name="postcode"
                  type="text"
                  autoComplete="postal-code"
                  placeholder="e.g. SW1A 1AA"
                  value={postcode}
                  onChange={(event) => setPostcode(event.target.value)}
                  className="w-40 rounded-lg border border-ink/20 bg-cream px-2.5 py-1.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-ink focus:ring-1 focus:ring-ink/15 sm:w-44"
                />
                <button
                  type="submit"
                  aria-label="Check coverage"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-mustard-pale transition hover:bg-ink-soft"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={EMAIL_HREF}
                  aria-label="Email us"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:bg-ink/5"
                >
                  <FaEnvelope className="h-4 w-4" />
                </a>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp inquiry"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:bg-ink/5"
                >
                  <FaWhatsapp className="h-4 w-4" />
                </a>
                <a
                  href={PHONE_HREF}
                  aria-label={`Call us on ${PHONE_DISPLAY}`}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-ink/15 px-3 text-ink transition hover:bg-ink/5"
                >
                  <FaPhone className="h-3.5 w-3.5" />
                  <span className="text-sm font-semibold tracking-tight">{PHONE_DISPLAY}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CoverageModal
        open={coverageOpen}
        onClose={() => setCoverageOpen(false)}
        initialBoundary={initialBoundary}
        initialPostcode={submittedPostcode}
      />
    </>
  );
}
