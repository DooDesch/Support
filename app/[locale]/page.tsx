import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations("header");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8 space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-pretty text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ReportForm siteKey={TURNSTILE_SITE_KEY} />
    </div>
  );
}
