import fr from "./fr.json";
import wo from "./wo.json";
import en from "./en.json";

export type Locale = "fr" | "wo" | "en";
export const SUPPORTED_LOCALES: Locale[] = ["fr", "wo", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

const DICTIONARIES: Record<Locale, Record<string, unknown>> = { fr, wo, en };

function resolve(dict: Record<string, unknown>, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{{${key}}}`
  );
}

export function t(path: string, vars?: Record<string, string | number>, locale: Locale = DEFAULT_LOCALE): string {
  const direct = resolve(DICTIONARIES[locale], path);
  if (direct !== undefined) return interpolate(direct, vars);

  return path;
}
