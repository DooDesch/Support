import { useTranslations } from "next-intl";
import { ArrowUpRightIcon } from "lucide-react";
import { PathCards } from "@/components/path-cards";
import type { Product } from "@/lib/products";

// Hero of a product quicklink page (/palvolve etc.).
export function ProductHero({ product }: { product: Product }) {
  const t = useTranslations("product");

  return (
    <section className="py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {t("heading", { name: product.displayName })}
      </h1>
      {product.repo.description && (
        <p className="mt-3 max-w-[65ch] text-pretty text-muted-foreground">
          {product.repo.description}
        </p>
      )}
      <a
        href={product.repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        {t("repoLink")}
        <ArrowUpRightIcon className="size-3.5" />
      </a>
      <div className="mt-8">
        <PathCards compact />
      </div>
    </section>
  );
}
