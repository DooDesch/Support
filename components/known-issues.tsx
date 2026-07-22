import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRightIcon } from "lucide-react";
import type { RepoIssue } from "@/lib/github";
import type { Product } from "@/lib/products";

// "How long ago" in the visitor's language, coarse on purpose.
function relativeTime(iso: string, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffMs = new Date(iso).getTime() - Date.now();
  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 31) return rtf.format(days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(Math.round(months / 12), "year");
}

// Open issues of a product so visitors can check whether their problem is
// already reported before filing a duplicate.
export function KnownIssues({
  issues,
  product,
}: {
  issues: RepoIssue[];
  product: Product;
}) {
  const t = useTranslations("product.knownIssues");
  const locale = useLocale();

  return (
    <section className="border-t border-border py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <a
          href={`${product.repo.url}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("viewAll")}
          <ArrowUpRightIcon className="size-3.5" />
        </a>
      </div>

      {issues.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {issues.map((issue) => (
            <li key={issue.url}>
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span className="font-medium underline-offset-4 group-hover:underline">
                  {issue.title}
                </span>
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>#{issue.number}</span>
                  <span className="rounded bg-warm px-1.5 py-0.5 font-medium text-warm-foreground">
                    {issue.source === "support"
                      ? t("sourceSupport")
                      : t("sourceRepo")}
                  </span>
                  <span>{relativeTime(issue.createdAt, locale)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
