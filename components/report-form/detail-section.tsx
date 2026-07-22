"use client";

import type { UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";
import { XIcon } from "lucide-react";
import { SEVERITIES, type DetailField, type Severity } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormValues } from "./types";

// One active optional detail field with its remove control.
export function DetailSection({
  field,
  severity,
  onSeverityChange,
  onRemove,
  register,
}: {
  field: DetailField;
  severity: Severity | null;
  onSeverityChange: (value: Severity | null) => void;
  onRemove: (field: DetailField) => void;
  register: UseFormRegister<FormValues>;
}) {
  const t = useTranslations("form");

  // value -> localized label, so the trigger shows e.g. "Mittel" not "medium".
  const severityLabels = {
    low: t("severityOptions.low"),
    medium: t("severityOptions.medium"),
    high: t("severityOptions.high"),
    critical: t("severityOptions.critical"),
  } as Record<Severity, string>;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={field}>{t(`sections.${field}`)}</Label>
        <button
          type="button"
          onClick={() => onRemove(field)}
          className="inline-flex items-center gap-1 rounded p-1 text-xs text-muted-foreground transition-colors hover:text-foreground active:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <XIcon className="size-3" />
          {t("remove")}
        </button>
      </div>

      {field === "severity" ? (
        <Select
          value={severity}
          onValueChange={(value) => onSeverityChange(value)}
          items={severityLabels}
        >
          <SelectTrigger id="severity" className="!h-10 w-full">
            <SelectValue placeholder={t("severityOptions.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`severityOptions.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field === "contact" ? (
        <>
          <Input
            id="contact"
            placeholder={t("placeholders.contact")}
            {...register("contact")}
          />
          <p className="text-xs text-muted-foreground">{t("contactHint")}</p>
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
  );
}
