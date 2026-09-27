import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { legalOperator } from "@/lib/legal";
import {
  LegalPage,
  LegalSection,
  OperatorAddress,
  OperatorEmail,
} from "@/components/legal/legal-page";

// Rendered at build time: the check in lib/legal.ts then stops the build when
// the operator data is empty.
export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imprint" });
  return {
    title: t("metaTitle"),
    alternates: {
      languages: { de: "/de/impressum", en: "/en/impressum" },
    },
  };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("imprint");

  return (
    <LegalPage title={t("title")}>
      <LegalSection title={t("provider")}>
        <OperatorAddress operator={legalOperator} />
      </LegalSection>
      <LegalSection title={t("contact")}>
        <p>
          {t("email")}: <OperatorEmail operator={legalOperator} />
        </p>
      </LegalSection>
      <LegalSection title={t("responsible")}>
        <OperatorAddress operator={legalOperator} />
      </LegalSection>
    </LegalPage>
  );
}
