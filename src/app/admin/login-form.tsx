"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 max-w-[22rem] space-y-4">
      <div>
        <label htmlFor="password" className="block text-[0.9375rem] font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "password-error" : undefined}
          className="field mt-2"
        />
        {state.error ? (
          <p id="password-error" role="alert" className="mt-1.5 text-[0.875rem] text-alert">
            {state.error}
          </p>
        ) : null}
      </div>
      <button type="submit" className="button" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
