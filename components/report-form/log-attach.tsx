"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileTextIcon, PaperclipIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  MAX_LOG_FILE_BYTES,
  isProbablyBinary,
  prepareLogForIssue,
} from "@/lib/log-extract";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}

export interface AttachedLog {
  fileName: string;
  content: string;
  truncated: boolean;
  redacted: boolean;
  originalLength: number;
}

const ACCEPTED_EXTENSIONS = [".log", ".txt"];

function formatKb(chars: number): string {
  return `${Math.max(1, Math.round(chars / 1024))} KB`;
}

// Drag-and-drop log attachment. The file is read in the browser only; its
// (redacted, shortened) content later travels inside the issue body and is
// never stored on our servers.
export function LogAttach({
  value,
  onChange,
}: {
  value: AttachedLog | null;
  onChange: (value: AttachedLog | null) => void;
}) {
  const t = useTranslations("form.log");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  async function handleFile(file: File) {
    const name = file.name.toLowerCase();
    const isAccepted =
      ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext)) ||
      file.type === "text/plain";
    if (!isAccepted) {
      toast.error(t("errors.invalidType"));
      return;
    }
    if (file.size > MAX_LOG_FILE_BYTES) {
      toast.error(t("errors.tooLarge"));
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      toast.error(t("errors.readFailed"));
      return;
    }
    if (isProbablyBinary(text)) {
      toast.error(t("errors.binary"));
      return;
    }

    const prepared = prepareLogForIssue(text);
    onChange({ fileName: file.name, ...prepared });
    window.umami?.track("log-attached");
  }

  if (value) {
    return (
      <div className="space-y-1.5">
        <Label>{t("label")}</Label>
        <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
          <div className="flex min-w-0 items-start gap-2.5">
            <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{value.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {t("attached", { size: formatKb(value.content.length) })}
                {value.truncated && <> {t("truncatedNote")}</>}
                {value.redacted && <> {t("redactedNote")}</>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex shrink-0 items-center gap-1 rounded p-1 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <XIcon className="size-3" />
            {t("remove")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="log-attach">{t("label")}</Label>
      <button
        id="log-attach"
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-input px-4 py-5 text-sm text-muted-foreground transition-colors",
          "hover:border-solid hover:border-ring hover:bg-accent hover:text-foreground",
          "focus-visible:border-solid focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          dragOver && "border-solid border-ring bg-accent text-foreground",
        )}
      >
        <PaperclipIcon className="size-4" />
        <span>{t("drop")}</span>
        <span className="text-xs">{t("browse")}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".log,.txt,text/plain"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
