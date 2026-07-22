import { useTranslations } from "next-intl";
import { ArrowDownIcon, ArrowUpRightIcon, TicketIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DISCORD_URL = "https://mods.doodesch.de";

// Official Discord mark (simple-icons path), inlined because lucide has no
// brand logos.
function DiscordMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

// The two support paths. Discord comes first (most users prefer it and get
// answers fastest); the ticket card jumps to the form further down the page.
export function PathCards({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("hero");

  const cardBase = cn(
    "group flex flex-col rounded-2xl border transition-colors",
    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    compact ? "gap-3 p-4" : "gap-4 p-5 sm:p-6",
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="cta-discord"
        className={cn(
          cardBase,
          "border-discord/40 bg-discord/10 hover:bg-discord/15 dark:bg-discord/15 dark:hover:bg-discord/20",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-discord text-discord-foreground">
            <DiscordMark className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className={cn("font-semibold", compact ? "text-base" : "text-lg")}>
              {t("discord.title")}
            </h2>
            <p className="text-xs font-medium text-muted-foreground">
              {t("discord.tag")}
            </p>
          </div>
        </div>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            {t("discord.description")}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium">
          {t("discord.cta")}
          <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </a>

      <a
        href="#report"
        data-umami-event="cta-ticket"
        className={cn(
          cardBase,
          "border-border bg-card hover:bg-muted/60 dark:hover:bg-muted/40",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <TicketIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className={cn("font-semibold", compact ? "text-base" : "text-lg")}>
              {t("ticket.title")}
            </h2>
            <p className="text-xs font-medium text-warm-foreground">
              <span className="rounded bg-warm px-1.5 py-0.5">
                {t("ticket.badge")}
              </span>
            </p>
          </div>
        </div>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            {t("ticket.description")}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium">
          {t("ticket.cta")}
          <ArrowDownIcon className="size-4 transition-transform group-hover:translate-y-0.5" />
        </span>
      </a>
    </div>
  );
}
