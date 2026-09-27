import { useTranslations } from "next-intl";
import { MessageCircleIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

const DISCORD_URL = "https://mods.doodesch.de";
const KOFI_URL = "https://ko-fi.com/doodesch";

const linkClass = "underline-offset-4 hover:text-foreground hover:underline";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border/60 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-center text-sm text-muted-foreground">
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
        <nav
          aria-label={t("legalNav")}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs"
        >
          <a
            href={KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {t("kofi")}
          </a>
          <Link href="/impressum" className={linkClass}>
            {t("imprint")}
          </Link>
          <Link href="/privacy" className={linkClass}>
            {t("privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
