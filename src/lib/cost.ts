/**
 * Meeting-cost math — pure, dependency-free, unit-tested.
 *
 * The whole experiment is a timer × a rate. Keeping the money math here (out of
 * the React component) means it can be verified in isolation and reused if the
 * UI changes.
 */

/** Default paid working hours per year: 40 h/week × 52 weeks. */
export const DEFAULT_HOURS_PER_YEAR = 2080;

/**
 * Dollars burned per second by a meeting.
 *
 * @param headcount     number of people in the meeting
 * @param annualSalary  average fully-loaded annual salary per person (USD)
 * @param hoursPerYear  paid working hours per year (default 2080)
 */
export function perSecondCost(
  headcount: number,
  annualSalary: number,
  hoursPerYear: number = DEFAULT_HOURS_PER_YEAR,
): number {
  if (
    !Number.isFinite(headcount) ||
    !Number.isFinite(annualSalary) ||
    !Number.isFinite(hoursPerYear) ||
    headcount <= 0 ||
    annualSalary <= 0 ||
    hoursPerYear <= 0
  ) {
    return 0;
  }
  const perPersonPerSecond = annualSalary / hoursPerYear / 3600;
  return perPersonPerSecond * headcount;
}

/** Total cost after `elapsedSeconds` at a given per-second rate. */
export function costAfter(elapsedSeconds: number, ratePerSecond: number): number {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) return 0;
  return elapsedSeconds * ratePerSecond;
}

/** Format a dollar amount as USD currency, always two decimals. */
export function formatUSD(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format elapsed seconds as H:MM:SS (hours omitted when zero). */
export function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
