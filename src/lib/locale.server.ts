import "server-only";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  isLocale,
  isTheme,
  type Locale,
  type Theme,
} from "./i18n";

export async function getLocale(): Promise<Locale> {
  const cookieValue = (await cookies()).get("locale")?.value;
  if (isLocale(cookieValue)) return cookieValue;
  const accept = (await headers()).get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("zh")) return "zh";
  if (first.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}

export async function getTheme(): Promise<Theme> {
  const cookieValue = (await cookies()).get("theme")?.value;
  if (isTheme(cookieValue)) return cookieValue;
  return "system";
}
