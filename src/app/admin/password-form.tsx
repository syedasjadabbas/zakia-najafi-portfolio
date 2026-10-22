"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type PasswordState } from "./actions";

/** Change the admin password. Asks for the current one first. */
export function PasswordForm({ minLength }: { minLength: number }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  const field = (name: "current" | "next" | "confirm", label: string, autoComplete: string, hint?: string) => (
    <label className="block min-w-0">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[0.9375rem] font-medium">{label}</span>
        {hint ? <span className="truncate text-[0.8125rem] text-soft">{hint}</span> : null}
      </span>
      <input
        type="password"
        name={name}
        required
        autoComplete={autoComplete}
        minLength={name === "current" ? undefined : minLength}
        aria-invalid={errors[name] ? true : undefined}
        className="field mt-1.5"
      />
      {errors[name] ? <span className="mt-1.5 block text-[0.875rem] text-alert">{errors[name]}</span> : null}
    </label>
  );

  return (
    <form ref={formRef} action={action} className="mt-4 space-y-4">
      {/* lets password managers save the new password against this sign-in */}
      <input type="text" name="username" autoComplete="username" value="admin" readOnly hidden />
      <div className="grid gap-4 md:grid-cols-3">
        {field("current", "Current password", "current-password")}
        {field("next", "New password", "new-password", `At least ${minLength} characters`)}
        {field("confirm", "Repeat new password", "new-password")}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="button button-outline" disabled={pending} data-pending={pending}>
          {pending ? "Saving…" : "Change password"}
        </button>
        {state.message ? (
          <p role="status" className={`text-[0.9375rem] ${state.ok ? "text-forest" : "text-alert"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
