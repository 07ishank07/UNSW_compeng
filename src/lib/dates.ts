// dates.ts — the ONE place event/post datetimes become human strings.
// Every formatter pins timeZone to Australia/Sydney: production builds run on
// UTC CI runners, and an unpinned toLocaleDateString would render UTC calendar
// dates (an 8am AEST event would show the previous day on the live site).
// isUpcoming compares epoch instants — timezone-independent — and mirrors the
// GROQ `startDateTime >= now()` boundary. Event status is DERIVED here at
// render, never stored (.claude/rules/content-modules.md).

const SYDNEY = "Australia/Sydney";

function enAU(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleString("en-AU", { timeZone: SYDNEY, ...options });
}

/** "17 Sep 2026" — list rows / home cards. */
export function formatDate(iso: string) {
  return enAU(iso, { day: "2-digit", month: "short", year: "numeric" });
}

/** "17 Sep 2026, 5:30 pm AEST" — upcoming-event cards. */
export function formatDateTime(iso: string) {
  return enAU(iso, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/** "Thursday, 17 September 2026" — event-detail Date row. */
export function formatDateLong(iso: string) {
  return enAU(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** "05:30 pm AEST" — event-detail Time row. */
export function formatTime(iso: string) {
  return enAU(iso, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
}

/** "17 September 2026" — blog post date line. */
export function formatDateFull(iso: string) {
  return enAU(iso, { day: "numeric", month: "long", year: "numeric" });
}

/** "17 Sep 2026" (no leading zero) — blog list rows. */
export function formatDateCompact(iso: string) {
  return enAU(iso, { day: "numeric", month: "short", year: "numeric" });
}

export function isUpcoming(iso: string) {
  return Date.parse(iso) >= Date.now();
}
