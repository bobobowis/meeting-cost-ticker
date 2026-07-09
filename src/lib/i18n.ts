/**
 * Localization + regional assumptions — EN/ES.
 *
 * Kept dependency-free and out of the component so copy and regional working-
 * hour presets can be unit-tested and reused across 00-lab experiments.
 */

export type Lang = "en" | "es";
export type Currency = "USD" | "EUR";

/** BCP-47 locale used for number/currency formatting per language. */
export const LOCALE: Record<Lang, string> = {
  en: "en-US",
  es: "es-ES",
};

/** Currency symbol shown inline in labels (full formatting uses Intl). */
export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
};

/**
 * Paid-working-hours-per-year presets. Spain figures are the standard
 * 225-working-day calculation (per board feedback, LAB-9); US is 40h × 52w.
 */
export interface HoursPreset {
  id: string;
  hours: number;
  label: Record<Lang, string>;
}

export const HOURS_PRESETS: HoursPreset[] = [
  { id: "us-40", hours: 2080, label: { en: "US — 40h/week (2,080)", es: "EE. UU. — 40h/sem (2080)" } },
  { id: "es-40", hours: 1826, label: { en: "Spain — 40h/week (1,826)", es: "España — 40h/sem (1826)" } },
  { id: "es-375", hours: 1690, label: { en: "Spain — 37.5h/week (1,690)", es: "España — 37,5h/sem (1690)" } },
  { id: "es-35", hours: 1575, label: { en: "Spain — 35h/week (1,575)", es: "España — 35h/sem (1575)" } },
];

/** UI copy. Functions take runtime values so plurals/interpolation stay in-file. */
export const T = {
  en: {
    tagline: "Watch the money burn in real time.",
    costAria: (money: string) => `Cost so far ${money}`,
    perHr: "/hr",
    perMin: "/min",
    start: "Start meeting",
    resume: "Resume",
    pause: "Pause",
    reset: "Reset",
    people: "People in the meeting",
    salary: (sym: string) => `Average salary (${sym}/yr)`,
    assumptions: "Assumptions",
    region: "Working hours / year",
    custom: "Custom…",
    shareHeading: "Share the damage",
    copied: "Copied ✓",
    copy: "Copy",
    footer: (hours: string) =>
      `Estimate only — salary ÷ ${hours} paid hours/yr, split per second. Nothing leaves your browser.`,
    credit: "A 00-lab experiment.",
    shareText: (money: string, people: number, clock: string) =>
      `This meeting has already burned ${money} (${people} people, ${clock}). Was it worth it? → Meeting Cost Ticker`,
  },
  es: {
    tagline: "Mira cómo arde el dinero en tiempo real.",
    costAria: (money: string) => `Coste hasta ahora ${money}`,
    perHr: "/h",
    perMin: "/min",
    start: "Empezar reunión",
    resume: "Reanudar",
    pause: "Pausar",
    reset: "Reiniciar",
    people: "Personas en la reunión",
    salary: (sym: string) => `Salario medio (${sym}/año)`,
    assumptions: "Supuestos",
    region: "Horas laborables / año",
    custom: "Personalizado…",
    shareHeading: "Comparte el gasto",
    copied: "Copiado ✓",
    copy: "Copiar",
    footer: (hours: string) =>
      `Solo una estimación — salario ÷ ${hours} horas pagadas/año, repartido por segundo. Nada sale de tu navegador.`,
    credit: "Un experimento de 00-lab.",
    shareText: (money: string, people: number, clock: string) =>
      `Esta reunión ya ha quemado ${money} (${people} personas, ${clock}). ¿Valió la pena? → Meeting Cost Ticker`,
  },
} satisfies Record<Lang, unknown>;
