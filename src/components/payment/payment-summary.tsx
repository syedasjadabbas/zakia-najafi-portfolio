import type { PaymentMethodOption, PaymentRegion } from "@/lib/payment-options";

/** Plain summary of what will be charged. Shows nothing as paid: there is no payment yet. */
export function PaymentSummary({
  lectureTitle,
  region,
  method,
}: {
  lectureTitle: string;
  region: PaymentRegion | null;
  method: PaymentMethodOption | null;
}) {
  const rows: [string, string][] = [
    ["Lecture", lectureTitle],
    ["Region", region?.label ?? "Not chosen yet"],
    ["Payment method", method?.label ?? (region ? "Not available yet" : "Choose a region first")],
    ["Registration fee", region?.feeLabel ?? "Depends on region"],
  ];

  return (
    <section aria-labelledby="summary-title" className="rounded-[6px] bg-sand p-6 md:p-7">
      <h3 id="summary-title" className="font-serif text-[1.5rem] leading-tight">
        Summary
      </h3>
      <dl className="mt-4 space-y-2.5 text-[0.9375rem]">
        {rows.map(([term, value]) => (
          <div key={term} className="flex justify-between gap-6">
            <dt className="text-soft">{term}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-sand-deep pt-4">
        <span className="font-serif text-[1.25rem]">Total</span>
        <span aria-live="polite" className="font-serif text-[1.75rem] leading-none text-forest">
          {region?.feeLabel ?? "Choose a region"}
        </span>
      </div>
    </section>
  );
}
