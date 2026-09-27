import type { Operator } from "@/lib/legal";

// Shared layout for the Impressum and the privacy notice.
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      <div className="mt-8 space-y-8 text-pretty text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

// Postal address block: name, street, postal code and city, country.
export function OperatorAddress({ operator }: { operator: Operator }) {
  return (
    <address className="not-italic">
      {operator.name}
      <br />
      {operator.street}
      <br />
      {operator.postalCode} {operator.city}
      <br />
      {operator.country}
    </address>
  );
}

export function OperatorEmail({ operator }: { operator: Operator }) {
  return <a href={`mailto:${operator.email}`}>{operator.email}</a>;
}
