import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const saved = cookieStore.get("GUAI_LOCALE")?.value ?? "";
  const locale = (routing.locales as readonly string[]).includes(saved)
    ? saved
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
