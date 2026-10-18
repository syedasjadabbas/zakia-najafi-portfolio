"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { register, type RegisterState } from "./actions";

type Props = {
  slug: string;
  priceLabel: string;
  mode: "free" | "manual" | "stripe";
  manualInstructions: string | null;
};

export function RegistrationForm({ slug, priceLabel, mode, manualInstructions }: Props) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(register.bind(null, slug), {});
  const errors = state.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

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
    <form ref={formRef} action={action} noValidate className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="font-serif text-[1.75rem] leading-tight">Your details</legend>
        <Field
          name="name"
          label="Full name"
          autoComplete="name"
          defaultValue={state.values?.name}
          error={errors.name}
        />
        <Field
          name="email"
          type="email"
          label="Email address"
          hint="Confirmation and joining details are linked to this address."
          autoComplete="email"
          defaultValue={state.values?.email}
          error={errors.email}
        />
      </fieldset>

      {mode === "manual" ? (
        <fieldset className="space-y-5">
          <legend className="font-serif text-[1.75rem] leading-tight">Payment · {priceLabel}</legend>
          <div className="whitespace-pre-line border-l-2 border-brass bg-sand px-5 py-4 text-[0.9688rem]">
            {manualInstructions}
          </div>
          <Field
            name="reference"
            label="Transaction reference"
            hint="The transaction ID or reference shown on your payment receipt."
            autoComplete="off"
            defaultValue={state.values?.reference}
            error={errors.reference}
          />
          <p className="text-[0.875rem] text-soft">
            Your place is confirmed once the payment has been verified. Joining instructions appear on your
            private registration page after confirmation.
          </p>
        </fieldset>
      ) : null}

      {mode === "stripe" ? (
        <p className="text-[0.9375rem] text-soft">
          You will be taken to a secure Stripe page to pay {priceLabel}. Your place is confirmed when the
          payment is complete.
        </p>
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
        <button type="submit" className="button w-full sm:w-auto" disabled={pending} data-pending={pending}>
          {pending ? (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory motion-reduce:animate-none"
            />
          ) : null}
          {pending
            ? "Submitting…"
            : mode === "stripe"
              ? "Continue to payment"
              : mode === "manual"
                ? "Submit registration"
                : "Register"}
        </button>
        <p className="text-[0.875rem] text-soft">
          Your name and email are used only for this registration. See the{" "}
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
  type = "text",
  autoComplete,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
}) {
  const describedBy = [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean).join(" ");
  return (
    <div className="max-w-[28rem]">
      <label htmlFor={name} className="block text-[0.9375rem] font-medium">
        {label}
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
        required
        autoComplete={autoComplete}
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
