import type { Price } from "@/content/lectures";

export function formatPrice(price: Price | null): string {
  if (!price) return "Free";
  const digits = new Intl.NumberFormat("en", { style: "currency", currency: price.currency })
    .resolvedOptions().maximumFractionDigits ?? 2;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: price.currency }).format(
    price.amount / 10 ** digits,
  );
}

/** e.g. "Saturday 21 November 2026" */
export function formatDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(iso));
}

/** e.g. "Sat 21 Nov" */
export function formatShortDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(new Date(iso));
}

/** e.g. "7:00 pm GMT" */
export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
    timeZoneName: "short",
  }).format(new Date(iso));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** Human label for an IANA zone, e.g. "Europe/London" → "London time". */
export function timeZoneLabel(timeZone: string): string {
  const city = timeZone.split("/").pop()?.replace(/_/g, " ");
  return city ? `${city} time` : timeZone;
}
