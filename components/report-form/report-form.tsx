"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { DETAIL_FIELDS, type DetailField, type Severity } from "@/lib/schema";
import { RepoCombobox, NO_PROJECT } from "@/components/repo-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DetailSection } from "./detail-section";
import { DetailChips } from "./detail-chips";
import { SubmitPanel } from "./submit-panel";
import { SuccessPanel } from "./success-panel";
import { useReportSubmit } from "./use-report-submit";
import { DEFAULTS, type FormValues } from "./types";

// The report form: only the title is required, every detail is progressively
// disclosed. Sections sit directly on the page background so adding details
// extends the page flow instead of inflating one bordered card.
export function ReportForm({
  siteKey,
  initialRepo,
}: {
  siteKey: string;
  initialRepo?: string;
}) {
  const t = useTranslations("form");
  const tValidation = useTranslations("validation");

  const form = useForm<FormValues>({ defaultValues: DEFAULTS, mode: "onBlur" });
  const {
    register,
    reset,
    formState: { errors },
  } = form;

  const [repo, setRepo] = React.useState(initialRepo ?? "");
  const [severity, setSeverity] = React.useState<Severity | null>(null);
  const [activeFields, setActiveFields] = React.useState<DetailField[]>([]);
  const turnstileRef = React.useRef<TurnstileInstance | null>(null);

  const submit = useReportSubmit({
    form,
    repo,
    severity,
    turnstileRef,
    onAfterSuccess: () => {
      reset(DEFAULTS);
      setRepo(initialRepo ?? "");
      setSeverity(null);
      setActiveFields([]);
    },
  });

  const orderedActive = DETAIL_FIELDS.filter((f) => activeFields.includes(f));
  const inactive = DETAIL_FIELDS.filter((f) => !activeFields.includes(f));

  function addField(field: DetailField) {
    setActiveFields((prev) => [...prev, field]);
  }

  function removeField(field: DetailField) {
    setActiveFields((prev) => prev.filter((f) => f !== field));
    if (field === "severity") {
      setSeverity(null);
      return;
    }
    form.setValue(field, "");
  }

  if (submit.result) {
    return <SuccessPanel result={submit.result} onReset={submit.resetResult} />;
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit.handleAnonymousSubmit();
      }}
      className="space-y-8"
    >
      {/* Basics: project and title */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="repo-combobox">{t("repoLabel")}</Label>
          <div id="repo-combobox">
            <RepoCombobox value={repo} onChange={setRepo} />
          </div>
          {repo === NO_PROJECT && (
            <p className="text-xs text-muted-foreground">{t("repoNoneHint")}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary dark:bg-primary/20 dark:text-primary-foreground">
              {t("requiredBadge")}
            </span>
          </div>
          <Input
            id="title"
            placeholder={t("titlePlaceholder")}
            aria-required="true"
            aria-invalid={errors.title ? "true" : undefined}
            aria-describedby={errors.title ? "title-error" : "title-hint"}
            {...register("title", { required: true, minLength: 3 })}
          />
          {errors.title ? (
            <p id="title-error" role="alert" className="text-xs text-destructive">
              {tValidation("title")}
            </p>
          ) : (
            <p id="title-hint" className="text-xs text-muted-foreground">
              {t("titleHint")}
            </p>
          )}
        </div>
      </section>

      {/* Optional details, progressively disclosed */}
      <section className="space-y-5 border-t border-border pt-8">
        {orderedActive.map((field) => (
          <DetailSection
            key={field}
            field={field}
            severity={severity}
            onSeverityChange={setSeverity}
            onRemove={removeField}
            register={register}
          />
        ))}
        <DetailChips fields={inactive} onAdd={addField} />
      </section>

      {/* Submit */}
      <section className="border-t border-border pt-8">
        {/* Honeypot (hidden from real users) */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        <SubmitPanel
          siteKey={siteKey}
          turnstileRef={turnstileRef}
          submitting={submit.submitting}
          githubUrl={submit.githubUrl}
          onGithubClick={submit.handleGithubSubmit}
        />
      </section>
    </form>
  );
}
