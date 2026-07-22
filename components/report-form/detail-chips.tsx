"use client";

import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";
import type { DetailField } from "@/lib/schema";
import { cn } from "@/lib/utils";

// Chip row for the not-yet-active optional fields.
export function DetailChips({
  fields,
  onAdd,
}: {
  fields: DetailField[];
  onAdd: (field: DetailField) => void;
}) {
  const t = useTranslations("form");

  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {t("addDetailsLabel")}
      </p>
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <button
            key={field}
            type="button"
            onClick={() => onAdd(field)}
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
  );
}
