"use client";

import type { PaymentMethodId, PaymentMethodOption } from "@/lib/payment-options";

/**
 * Payment methods for the chosen region. Methods whose gateway is not live yet
 * are shown, but cannot be selected.
 */
export function MethodOptions({
  methods,
  liveMethodIds,
  value,
  onChange,
}: {
  methods: PaymentMethodOption[];
  liveMethodIds: PaymentMethodId[];
  value: PaymentMethodId | null;
  onChange: (id: PaymentMethodId) => void;
}) {
  return (
    <fieldset>
      <legend className="font-serif text-[1.75rem] leading-tight">Payment method</legend>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {methods.map((method) => {
          const live = liveMethodIds.includes(method.id);
          const selected = live && value === method.id;
          const noteId = `method-${method.id}-note`;
          return (
            <li key={method.id}>
              <label
                className={[
                  "flex items-center gap-4 py-4",
                  live ? "cursor-pointer" : "cursor-not-allowed",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="method"
                  value={method.id}
                  checked={selected}
                  disabled={!live}
                  aria-describedby={noteId}
                  onChange={() => onChange(method.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={[
                    "flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-forest" : "border-soft/40",
                    live ? "" : "bg-sand/60",
                  ].join(" ")}
                >
                  {selected ? <span className="h-2 w-2 rounded-full bg-forest" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block font-serif text-[1.1875rem] leading-snug ${live ? "text-ink" : "text-soft"}`}>
                    {method.label}
                  </span>
                  <span className="block text-[0.875rem] text-soft">{method.description}</span>
                </span>
                <span
                  id={noteId}
                  className={`shrink-0 text-[0.75rem] font-medium uppercase tracking-[0.12em] ${live ? "text-forest" : "text-brass-dark"}`}
                >
                  {live ? "Available" : "Coming soon"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
