"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, ChevronsUpDownIcon, StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Sentinel value meaning the user explicitly chose "no matching project".
export const NO_PROJECT = "__none__";

interface RepoOption {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
}

export function RepoCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("form");
  const [open, setOpen] = React.useState(false);
  const [repos, setRepos] = React.useState<RepoOption[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );

  React.useEffect(() => {
    let active = true;
    fetch("/api/repos")
      .then((res) => res.json())
      .then((data: { repos?: RepoOption[] }) => {
        if (!active) return;
        if (Array.isArray(data.repos)) {
          setRepos(data.repos);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const selected = repos.find((r) => r.fullName === value);
  const triggerText =
    value === NO_PROJECT
      ? t("repoNone")
      : selected
        ? selected.name
        : value || t("repoPlaceholder");
  const isPlaceholder = !value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        <span className={cn("truncate", isPlaceholder && "text-muted-foreground")}>
          {triggerText}
        </span>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={t("repoSearchPlaceholder")} />
          <CommandList>
            {status === "loading" && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t("repoLoading")}
              </div>
            )}
            {status === "error" && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t("repoError")}
              </div>
            )}
            {status === "ready" && (
              <>
                <CommandEmpty>{t("repoEmpty")}</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="no-project kein-projekt none"
                    onSelect={() => {
                      onChange(NO_PROJECT);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "size-4",
                        value === NO_PROJECT ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="text-muted-foreground">
                      {t("repoNone")}
                    </span>
                  </CommandItem>
                  {repos.map((repo) => (
                    <CommandItem
                      key={repo.fullName}
                      value={`${repo.fullName} ${repo.description ?? ""}`}
                      onSelect={() => {
                        onChange(repo.fullName);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "size-4",
                          value === repo.fullName ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{repo.name}</span>
                        {repo.description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {repo.description}
                          </span>
                        )}
                      </div>
                      {repo.stars > 0 && (
                        <span className="ml-2 flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                          <StarIcon className="size-3" />
                          {repo.stars}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
