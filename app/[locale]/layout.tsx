import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteFooter } from "@/components/site-footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: { de: "/de", en: "/en" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col antialiased">
        {/* cookieless analytics (self-hosted Umami) */}
        <Script
          src="https://stats.doodesch.de/script.js"
          data-website-id="4a41ea05-d24c-4758-8dcf-5dbebb5124b8"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
            <header className="border-b border-border/60">
              <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
                <Link
                  href="/"
                  className="text-sm font-semibold tracking-tight"
                >
                  DooDesch{" "}
                  <span className="font-normal text-muted-foreground">
                    Support
                  </span>
                </Link>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
