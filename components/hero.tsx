import { useTranslations } from "next-intl";
import { PathCards } from "@/components/path-cards";

// Home hero: one headline, one sentence, then the two support paths.
export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="py-10 sm:py-16">
      <h1 className="max-w-[20ch] text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        {t.rich("title", {
          accent: (chunks) => <span className="text-primary">{chunks}</span>,
        })}
      </h1>
      <p className="mt-4 max-w-[60ch] text-pretty text-lg text-muted-foreground">
        {t("subtitle")}
      </p>
      <div className="mt-8 sm:mt-10">
        <PathCards />
      </div>
    </section>
  );
}
