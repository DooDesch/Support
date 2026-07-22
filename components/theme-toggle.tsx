"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Snapshot is false on the server, true after hydration on the client.
const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("theme");
  // next-themes only knows the real theme on the client; render an invisible
  // placeholder of the same size until mounted to avoid a hydration mismatch.
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-hidden="true"
        disabled
        className="opacity-0"
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggle")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
