import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "never",       // no /vi/ or /en/ in URLs
  localeCookie: {
    name: "GUAI_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});
