import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import type { Severity } from "@/lib/schema";
import { buildIssueBody } from "@/lib/issue-body";
import { NO_PROJECT } from "@/components/repo-combobox";
import {
  MAX_GITHUB_URL,
  SUPPORT_REPO,
  type FormValues,
  type SubmitResult,
} from "./types";

// Owns both submit paths and their transient state. The anonymous path is the
// form's default submit; the GitHub handoff opens a prefilled issue URL.
export function useReportSubmit({
  form,
  repo,
  severity,
  turnstileRef,
  onAfterSuccess,
}: {
  form: UseFormReturn<FormValues>;
  repo: string;
  severity: Severity | null;
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  onAfterSuccess: () => void;
}) {
  const t = useTranslations("form");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const bodyLocale = locale === "en" ? "en" : "de";

  const [submitting, setSubmitting] = React.useState(false);
  const [githubUrl, setGithubUrl] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<SubmitResult | null>(null);

  const mountedAt = React.useRef<number>(0);

  // Record the mount time in an effect (impure calls aren't allowed in render).
  React.useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function buildGithubUrl(values: FormValues): string {
    // When a repo is chosen, post into that repo (the reporter is the author);
    // otherwise fall back to the central Support repo for triage.
    const targetRepo = repo && repo !== NO_PROJECT ? repo : SUPPORT_REPO;

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
      severity: severity ?? undefined,
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

  // Secondary path: hand off to GitHub so the reporter posts as themselves.
  function handleGithubSubmit() {
    const values = form.getValues();
    if (!values.title || values.title.trim().length < 3) {
      void form.trigger("title");
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

  // Primary path: create the issue server-side (bot-authored, anonymous).
  async function handleAnonymousSubmit() {
    const isValid = await form.trigger();
    if (!isValid) return;
    const values = form.getValues();

    setSubmitting(true);
    try {
      const token =
        (await turnstileRef.current
          ?.getResponsePromise()
          .catch(() => undefined)) ?? "";

      const payload = {
        ...values,
        repo: repo === NO_PROJECT ? "" : repo,
        severity: severity ?? undefined,
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
        setResult({
          url: data.issueUrl ?? null,
          number: data.issueNumber ?? null,
        });
        onAfterSuccess();
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

  function resetResult() {
    setResult(null);
    setGithubUrl(null);
    mountedAt.current = Date.now();
  }

  return {
    submitting,
    githubUrl,
    result,
    handleGithubSubmit,
    handleAnonymousSubmit,
    resetResult,
  };
}
