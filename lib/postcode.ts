const UK_POSTCODE_REGEX =
  /^(GIR 0AA|(?:[A-Z][0-9]{1,2}|[A-Z][A-HJ-Y][0-9]{1,2}|[A-Z][0-9][A-Z]|[A-Z][A-HJ-Y][0-9][A-Z]) [0-9][A-Z]{2})$/;

export function normalizeUkPostcode(value: string): string | null {
  if (!value) {
    return null;
  }

  const compact = value.trim().toUpperCase().replace(/\s+/g, "");

  if (compact.length < 5 || compact.length > 7) {
    return null;
  }

  const outward = compact.slice(0, -3);
  const inward = compact.slice(-3);
  const normalized = `${outward} ${inward}`;

  if (!UK_POSTCODE_REGEX.test(normalized)) {
    return null;
  }

  return normalized;
}
