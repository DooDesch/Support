"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { ExternalLinkIcon, Loader2Icon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Turnstile plus both submit actions. The anonymous path is the form's
// default submit (no account needed); the GitHub handoff is secondary.
export function SubmitPanel({
  siteKey,
  turnstileRef,
  submitting,
  githubUrl,
  onGithubClick,
}: {
  siteKey: string;
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  submitting: boolean;
  githubUrl: string | null;
  onGithubClick: () => void;
}) {
  const t = useTranslations("form");
  const locale = useLocale();

  return (
    <div className="space-y-4">
      {/* Turnstile is only needed for the anonymous path. key={locale} forces a
          clean re-init when the language (route) changes. */}
      <div className="flex justify-center">
        <Turnstile
          key={locale}
          ref={turnstileRef}
          siteKey={siteKey}
          options={{ appearance: "interaction-only", theme: "auto" }}
        />
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={submitting}
          data-umami-event="submit-anon"
        >
          {submitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            <>
              <SendIcon className="size-4" />
              {t("submitAnon")}
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {t("anonHint")}
        </p>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-2 h-11 w-full"
          onClick={onGithubClick}
          data-umami-event="submit-github"
        >
          <ExternalLinkIcon className="size-4" />
          {t("submitGithub")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {t("githubHint")}
        </p>
        {githubUrl && (
          <p className="text-center text-xs">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {t("githubFallback")}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
