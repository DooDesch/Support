"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import {
  PlusIcon,
  XIcon,
  Loader2Icon,
  SendIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { DETAIL_FIELDS, SEVERITIES, type DetailField } from "@/lib/schema";
import { buildIssueBody } from "@/lib/issue-body";
import { RepoCombobox, NO_PROJECT } from "@/components/repo-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormValues = {
  title: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  environment: string;
  severity: "" | (typeof SEVERITIES)[number];
  additional: string;
  contact: string;
  website: string; // honeypot
};

const DEFAULTS: FormValues = {
  title: "",
  description: "",
  steps: "",
  expected: "",
  actual: "",
  environment: "",
  severity: "",
  additional: "",
  contact: "",
  website: "",
};

const GITHUB_OWNER = "DooDesch";
const SUPPORT_REPO = `${GITHUB_OWNER}/Support`;
// Stay well under GitHub's ~8KB prefilled-URL limit (414 above it).
const MAX_GITHUB_URL = 6500;

export function ReportForm({ siteKey }: { siteKey: string }) {
  const t = useTranslations("form");
  const tErrors = useTranslations("errors");
  const tSuccess = useTranslations("success");
  const tValidation = useTranslations("validation");
  const locale = useLocale();
  const bodyLocale = locale === "en" ? "en" : "de";

  const {
    register,
    trigger,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULTS, mode: "onBlur" });

  const [repo, setRepo] = React.useState("");
  const [activeFields, setActiveFields] = React.useState<DetailField[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [githubUrl, setGithubUrl] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{
    url: string | null;
    number: number | null;
  } | null>(null);

  const turnstileRef = React.useRef<TurnstileInstance | null>(null);
  const mountedAt = React.useRef<number>(0);

  // Record the mount time in an effect (impure calls aren't allowed in render).
  React.useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const orderedActive = DETAIL_FIELDS.filter((f) => activeFields.includes(f));
  const inactive = DETAIL_FIELDS.filter((f) => !activeFields.includes(f));

  function addField(field: DetailField) {
    setActiveFields((prev) => [...prev, field]);
  }

  function removeField(field: DetailField) {
    setActiveFields((prev) => prev.filter((f) => f !== field));
    setValue(field, "");
  }

  function resetForm() {
    setResult(null);
    mountedAt.current = Date.now();
  }

  function buildGithubUrl(values: FormValues): string {
    // When a repo is chosen, post into that repo (the reporter is the author);
    // otherwise fall back to the central Support repo for triage.
    const targetRepo =
      repo && repo !== NO_PROJECT ? repo : SUPPORT_REPO;

    // Reuse the same markdown builder as the server, but omit the "reference"
    // line (a self-reference to the target repo would be redundant).
    const body = buildIssueBody({
      title: values.title,
      repo: "",
      description: values.description,
      steps: values.steps,
      expected: values.expected,
      actual: values.actual,
      environment: values.environment,
      severity: values.severity || undefined,
      additional: values.additional,
      contact: values.contact,
      locale: bodyLocale,
    });

    const base = `https://github.com/${targetRepo}/issues/new`;
    const title = values.title.trim();
    const make = (b: string) =>
      `${base}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(b)}`;

    let url = make(body);
    if (url.length > MAX_GITHUB_URL) {
      const note =
        bodyLocale === "en"
          ? "\n\n_(truncated - please add details on GitHub)_"
          : "\n\n_(gekürzt - bitte bei Bedarf auf GitHub ergänzen)_";
      let trimmed = body;
      while (trimmed.length > 0 && make(trimmed + note).length > MAX_GITHUB_URL) {
        trimmed = trimmed.slice(0, Math.floor(trimmed.length * 0.9));
      }
      url = make(trimmed + note);
    }
    return url;
  }

  // Primary path: hand off to GitHub so the reporter posts as themselves.
  function handleGithubSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = getValues();
    if (!values.title || values.title.trim().length < 3) {
      void trigger("title");
      return;
    }
    const url = buildGithubUrl(values);
    setGithubUrl(url);
    // Open via a synthetic anchor: keeps the user-gesture context (so it isn't
    // popup-blocked) and applies noopener.
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success(t("githubOpened"));
  }

  // Fallback path: create the issue server-side (bot-authored, anonymous).
  async function handleAnonymousSubmit() {
    const isValid = await trigger();
    if (!isValid) return;
    const values = getValues();

    setSubmitting(true);
    try {
      const token =
        (await turnstileRef.current
          ?.getResponsePromise()
          .catch(() => undefined)) ?? "";

      const payload = {
        ...values,
        repo: repo === NO_PROJECT ? "" : repo,
        severity: values.severity || undefined,
        locale,
        elapsedMs: Date.now() - mountedAt.current,
        turnstileToken: token,
      };

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setResult({ url: data.issueUrl ?? null, number: data.issueNumber ?? null });
        reset(DEFAULTS);
        setRepo("");
        setActiveFields([]);
      } else {
        const map: Record<string, string> = {
          rate_limit: "rateLimit",
          captcha: "captcha",
          validation: "validation",
        };
        toast.error(tErrors(map[data?.error] ?? "generic"));
      }
      turnstileRef.current?.reset();
    } catch {
      toast.error(tErrors("generic"));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CircleCheckIcon className="size-6" />
        </div>
        <h2 className="text-xl font-semibold">{tSuccess("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {tSuccess("message")}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {result.url && (
            <Button
              variant="outline"
              render={
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {tSuccess("viewIssue")}
              <ExternalLinkIcon className="size-4" />
            </Button>
          )}
          <Button onClick={resetForm}>{tSuccess("another")}</Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleGithubSubmit}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      {/* Repository selector */}
      <div className="space-y-1.5">
        <Label htmlFor="repo-combobox">{t("repoLabel")}</Label>
        <div id="repo-combobox">
          <RepoCombobox value={repo} onChange={setRepo} />
        </div>
        {repo === NO_PROJECT && (
          <p className="text-xs text-muted-foreground">{t("repoNoneHint")}</p>
        )}
      </div>

      {/* Title (only required field) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label htmlFor="title">{t("titleLabel")}</Label>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
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

      {/* Active optional detail fields */}
      {orderedActive.length > 0 && (
        <div className="space-y-5">
          {orderedActive.map((field) => (
            <div key={field} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field}>{t(`sections.${field}`)}</Label>
                <button
                  type="button"
                  onClick={() => removeField(field)}
                  className="inline-flex items-center gap-1 rounded p-1 text-xs text-muted-foreground transition-colors hover:text-foreground active:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <XIcon className="size-3" />
                  {t("remove")}
                </button>
              </div>

              {field === "severity" ? (
                <select
                  id="severity"
                  {...register("severity")}
                  className="flex h-10 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">{t("severityOptions.placeholder")}</option>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {t(`severityOptions.${s}`)}
                    </option>
                  ))}
                </select>
              ) : field === "contact" ? (
                <>
                  <Input
                    id="contact"
                    placeholder={t("placeholders.contact")}
                    {...register("contact")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("contactHint")}
                  </p>
                </>
              ) : (
                <Textarea
                  id={field}
                  rows={field === "description" || field === "steps" ? 4 : 3}
                  placeholder={t(`placeholders.${field}`)}
                  {...register(field)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* "Add detail" chips */}
      {inactive.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {t("addDetailsLabel")}
          </p>
          <div className="flex flex-wrap gap-2">
            {inactive.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => addField(field)}
                className={cn(
                  "inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full border border-dashed border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                  "hover:border-solid hover:border-ring hover:bg-accent hover:text-foreground",
                  "active:bg-accent active:text-foreground",
                  "focus-visible:border-solid focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              >
                <PlusIcon className="size-3.5" />
                {t(`sections.${field}`)}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Primary: post with the reporter's own GitHub account */}
      <div className="space-y-2">
        <Button type="submit" size="lg" className="h-11 w-full">
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

        {/* Fallback: anonymous, server-created issue */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-2 h-11 w-full"
          onClick={handleAnonymousSubmit}
          disabled={submitting}
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
      </div>
    </form>
  );
}
