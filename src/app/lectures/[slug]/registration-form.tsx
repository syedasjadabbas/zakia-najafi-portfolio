"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { MethodOptions } from "@/components/payment/method-options";
import { PaymentSummary } from "@/components/payment/payment-summary";
import { RegionSelector } from "@/components/payment/region-selector";
import {
  getPaymentMethod,
  getPaymentRegion,
  paymentsComingSoonNotice,
  regionsWithFees,
  type LectureFees,
  type PaymentMethodId,
  type PaymentRegionId,
} from "@/lib/payment-options";
import { register, type RegisterState } from "./actions";

type Props = {
  slug: string;
  lectureTitle: string;
  paid: boolean;
  /** The lecture's own fees; paid lectures without them use the defaults. */
  fees?: LectureFees;
  /** Methods whose gateway is live and configured on the server. */
  liveMethodIds: PaymentMethodId[];
};

export function RegistrationForm({ slug, lectureTitle, paid, fees, liveMethodIds }: Props) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(register.bind(null, slug), {});
  const errors = state.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  const [regionId, setRegionId] = useState<PaymentRegionId | null>(
    (state.values?.region as PaymentRegionId | undefined) ?? null,
  );
  const [methodId, setMethodId] = useState<PaymentMethodId | null>(null);
  const regions = regionsWithFees(fees);
  const region = getPaymentRegion(regionId, fees) ?? null;
  const method = region ? (getPaymentMethod(region, methodId) ?? null) : null;
  const regionHasLiveMethod = Boolean(region?.methods.some((m) => liveMethodIds.includes(m.id)));
  const canProceed = Boolean(region && method && liveMethodIds.includes(method.id));

  function chooseRegion(id: PaymentRegionId) {
    setRegionId(id);
    // Preselect the first available method in the new region, if any.
    const next = getPaymentRegion(id, fees)?.methods.find((m) => liveMethodIds.includes(m.id));
    setMethodId(next?.id ?? null);
  }

  // After a failed submission, move focus to the first problem so it is seen and announced.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const target = form.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
    if (target) {
      if (target.getAttribute("role") === "alert") target.setAttribute("tabindex", "-1");
      target.focus();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} noValidate className="space-y-12">
      <fieldset className="space-y-5">
        <legend className="font-serif text-[1.75rem] leading-tight">Your details</legend>
        <Field name="name" label="Full name" autoComplete="name" defaultValue={state.values?.name} error={errors.name} />
        <Field
          name="email"
          type="email"
          label="Email address"
          hint="Your confirmation and joining details are linked to this address."
          autoComplete="email"
          defaultValue={state.values?.email}
          error={errors.email}
        />
        <Field
          name="whatsapp"
          type="tel"
          label="WhatsApp number"
          optional
          hint="Include your country code, for example +92 300 1234567."
          autoComplete="tel"
          inputMode="tel"
          defaultValue={state.values?.whatsapp}
          error={errors.whatsapp}
        />
      </fieldset>

      {paid ? (
        <>
          <RegionSelector regions={regions} value={regionId} onChange={chooseRegion} error={errors.region} />

          {region ? (
            <MethodOptions
              methods={region.methods}
              liveMethodIds={liveMethodIds}
              value={methodId}
              onChange={setMethodId}
            />
          ) : null}

          <PaymentSummary lectureTitle={lectureTitle} region={region} method={method} />
        </>
      ) : null}

      {/* Honeypot field, hidden from people and assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-4">
        {state.message ? (
          <p role="alert" className="text-[0.9375rem] text-alert">
            {state.message}
          </p>
        ) : null}

        {paid ? (
          <>
            <button
              type="submit"
              className="button w-full sm:w-auto"
              disabled={!canProceed || pending}
              aria-describedby="payment-status"
              data-pending={pending}
            >
              {pending ? (
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory motion-reduce:animate-none"
                />
              ) : null}
              {pending ? "Opening secure payment…" : "Proceed to payment"}
            </button>
            <p id="payment-status" className="text-[0.9375rem] text-soft">
              {region && !regionHasLiveMethod
                ? paymentsComingSoonNotice
                : !region
                  ? "Choose where you are paying from to see the fee."
                  : !method
                    ? "Choose a payment method to continue."
                    : "You will complete payment on the provider’s secure page. Your place is confirmed once payment is verified."}
            </p>
          </>
        ) : (
          <button type="submit" className="button w-full sm:w-auto" disabled={pending} data-pending={pending}>
            {pending ? (
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory motion-reduce:animate-none"
              />
            ) : null}
            {pending ? "Registering…" : "Register"}
          </button>
        )}

        <p className="text-[0.875rem] text-soft">
          Your details are used only for this registration. See the{" "}
          <Link href="/privacy" className="link">
            privacy notice
          </Link>
          .
        </p>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  hint,
  error,
  optional = false,
  type = "text",
  autoComplete,
  inputMode,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: "tel" | "email" | "text";
  defaultValue?: string;
}) {
  const describedBy = [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean).join(" ");
  return (
    <div className="max-w-[28rem]">
      <label htmlFor={name} className="block text-[0.9375rem] font-medium">
        {label}
        {optional ? <span className="font-normal text-soft"> (optional)</span> : null}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="mt-0.5 text-[0.875rem] text-soft">
          {hint}
        </p>
      ) : null}
      <input
        id={name}
        name={name}
        type={type}
        required={!optional}
        autoComplete={autoComplete}
        inputMode={inputMode}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="field mt-2"
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-[0.875rem] text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
