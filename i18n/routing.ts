import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // German first (primary audience), English as the second supported language.
  locales: ["de", "en"],
  defaultLocale: "de",
  // Always show the locale prefix (/de, /en) for clear, SEO-friendly URLs.
  localePrefix: "always",
  // Detect via cookie + Accept-Language header on first visit.
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
