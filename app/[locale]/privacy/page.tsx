import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { legalOperator, legalPrivacyFacts } from "@/lib/legal";
import { LegalPage } from "@/components/legal/legal-page";
import { PrivacyDe } from "@/components/legal/privacy-de";
import { PrivacyEn } from "@/components/legal/privacy-en";

// Rendered at build time: the check in lib/legal.ts then stops the build when
// the operator data is empty.
export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("metaTitle"),
    alternates: {
      languages: { de: "/de/privacy", en: "/en/privacy" },
    },
  };
}

// The notice body is long legal prose, so each language has its own component
// instead of one message key per paragraph.
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  const Body = locale === "en" ? PrivacyEn : PrivacyDe;

  return (
    <LegalPage title={t("title")}>
      <Body operator={legalOperator} facts={legalPrivacyFacts} />
    </LegalPage>
  );
}
