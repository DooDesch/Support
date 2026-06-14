"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("language");

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1 text-sm">
      {routing.locales.map((l, index) => (
        <span key={l} className="flex items-center gap-1">
          {index > 0 && <span className="text-muted-foreground/40">/</span>}
          <Link
            href={pathname}
            locale={l}
            aria-current={l === locale ? "true" : undefined}
            className={cn(
              "rounded px-2 py-1 transition-colors hover:text-foreground",
              l === locale
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {t(l)}
          </Link>
        </span>
      ))}
    </nav>
  );
}
