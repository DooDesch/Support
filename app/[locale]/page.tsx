import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero";
import { ReportForm } from "@/components/report-form/report-form";

// Rendered per request so the Turnstile site key is read from runtime env
// (configured in Dokploy) rather than frozen at build time.
export const dynamic = "force-dynamic";

// Cloudflare Turnstile site key (public). Falls back to the "always passes"
// test key so local development works without configuration.
const TURNSTILE_SITE_KEY =
  process.env.TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <Hero />
      <section
        id="report"
        className="mx-auto w-full max-w-2xl scroll-mt-8 border-t border-border py-10 sm:py-14"
      >
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("formTitle")}
          </h2>
          <p className="text-pretty text-muted-foreground">
            {t("formSubtitle")}
          </p>
        </div>
        <ReportForm siteKey={TURNSTILE_SITE_KEY} />
      </section>
    </div>
  );
}
