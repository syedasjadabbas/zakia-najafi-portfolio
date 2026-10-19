"use client";

import type { PaymentRegion, PaymentRegionId } from "@/lib/payment-options";

/**
 * Choice of payment region, as a native radio group (arrow keys move between
 * options). Each option shows the fee that applies to that region.
 */
export function RegionSelector({
  regions,
  value,
  onChange,
  error,
}: {
  regions: PaymentRegion[];
  value: PaymentRegionId | null;
  onChange: (id: PaymentRegionId) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? "region-error" : undefined}>
      <legend className="font-serif text-[1.75rem] leading-tight">Where are you paying from?</legend>
      <p className="mt-1 text-[0.9375rem] text-soft">The registration fee depends on your region.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {regions.map((region) => {
          const selected = value === region.id;
          return (
            <label
              key={region.id}
              className={[
                "relative flex cursor-pointer flex-col rounded-[6px] border p-5 transition-colors",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass",
                selected ? "border-forest bg-forest-tint/45" : "border-line bg-[#fffdf8] hover:border-soft/50",
              ].join(" ")}
            >
              <input
                type="radio"
                name="region"
                value={region.id}
                checked={selected}
                onChange={() => onChange(region.id)}
                className="sr-only"
              />
              <span className="flex items-start justify-between gap-3">
                <span className="font-serif text-[1.375rem] leading-tight">{region.label}</span>
                <span
                  aria-hidden
                  className={[
                    "mt-1 flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-forest" : "border-soft/50",
                  ].join(" ")}
                >
                  {selected ? <span className="h-2 w-2 rounded-full bg-forest" /> : null}
                </span>
              </span>
              <span className="mt-1 text-[0.875rem] text-soft">{region.audience}</span>
              <span className="mt-4 font-serif text-[1.5rem] leading-none text-forest">{region.feeLabel}</span>
              <span className="mt-2 text-[0.875rem] text-soft">
                {region.methods.map((method) => method.label).join(" · ")}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id="region-error" className="mt-2 text-[0.875rem] text-alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
