import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { resolveProduct, type Product } from "@/lib/products";
import { getKnownIssues } from "@/lib/known-issues";
import { serverConfig } from "@/lib/env";
import { ProductHero } from "@/components/product-hero";
import { KnownIssues } from "@/components/known-issues";
import { ReportForm } from "@/components/report-form/report-form";

// Always rendered per request: the product list comes from the (cached)
// GitHub API and the Turnstile site key from runtime env.
export const dynamic = "force-dynamic";

// A GitHub outage without a warm cache resolves to "unknown product" (404),
// never to a 500.
async function safeResolveProduct(slug: string): Promise<Product | null> {
  try {
    return await resolveProduct(slug);
  } catch (error) {
    console.error(`Failed to resolve product slug "${slug}":`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await safeResolveProduct(slug);
  if (!product) return {};

  const t = await getTranslations({ locale, namespace: "product" });
  return {
    title: t("metaTitle", { name: product.displayName }),
    description: t("metaDescription", { name: product.displayName }),
    alternates: {
      languages: {
        de: `/de/${product.slug}`,
        en: `/en/${product.slug}`,
      },
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await safeResolveProduct(slug);
  if (!product) notFound();

  const issues = await getKnownIssues(product);
  const t = await getTranslations("home");

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <ProductHero product={product} />
      {issues !== null && <KnownIssues issues={issues} product={product} />}
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
        <ReportForm
          siteKey={serverConfig.turnstileSiteKey}
          initialRepo={product.repo.fullName}
        />
      </section>
    </div>
  );
}
