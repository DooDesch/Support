"use client";

import { useTranslations } from "next-intl";
import { CircleCheckIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubmitResult } from "./types";

// Terminal state after a successful anonymous submission.
export function SuccessPanel({
  result,
  onReset,
}: {
  result: SubmitResult;
  onReset: () => void;
}) {
  const t = useTranslations("success");

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CircleCheckIcon className="size-6" />
      </div>
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("message")}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {result.url && (
          <Button
            variant="outline"
            render={
              <a href={result.url} target="_blank" rel="noopener noreferrer" />
            }
          >
            {t("viewIssue")}
            <ExternalLinkIcon className="size-4" />
          </Button>
        )}
        <Button onClick={onReset}>{t("another")}</Button>
      </div>
    </div>
  );
}
