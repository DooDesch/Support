import { useTranslations } from "next-intl";
import { MessageCircleIcon } from "lucide-react";

const DISCORD_URL = "https://mods.doodesch.de";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border/60 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 text-center text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <MessageCircleIcon className="size-3.5" aria-hidden="true" />
          <span>{t("discordCta")}</span>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t("discordLink")}
          </a>
        </p>
      </div>
    </footer>
  );
}
