import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

// Localized 404, shown for unknown product slugs within a valid locale.
// not-found files receive no params; next-intl resolves the locale from the
// request config.
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-[50ch] text-pretty text-muted-foreground">
        {t("message")}
      </p>
      <Button className="mt-8" render={<Link href="/" />}>
        {t("backHome")}
      </Button>
    </div>
  );
}
