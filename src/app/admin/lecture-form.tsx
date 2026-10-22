"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { lectureTimeZones } from "@/lib/lecture-time-zones";
import { saveLecture, type LectureFormState } from "./actions";

export type LectureFormValues = {
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  timeZone: string;
  duration: number;
  language: string;
  platform: string;
  paid: boolean;
  capacity: string;
  registration: "open" | "not-yet-open" | "closed";
  instructions: string;
};

const durations = [30, 45, 60, 75, 90, 120, 150, 180];
const durationLabel = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ""}`;
const registrationLabel = { open: "Registration open", "not-yet-open": "Opens later", closed: "Registration closed" };

/** Publish a new lecture, or edit one. The essentials first; the rest folded under "More options". */
export function LectureForm({ initial, paymentsLive }: { initial: LectureFormValues; paymentsLive: boolean }) {
  const editing = Boolean(initial.slug);
  const [paid, setPaid] = useState(initial.paid);
  const [state, action, pending] = useActionState<LectureFormState, FormData>(saveLecture, {});
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.errors ?? {};
  const moreHasError = Boolean(
    errors.description || errors.timeZone || errors.duration || errors.language || errors.platform || errors.capacity,
  );

  // A new lecture: clear the form after publishing so the next one starts fresh.
  useEffect(() => {
    if (state.ok && !editing) formRef.current?.reset();
  }, [state, editing]);

  const zone = lectureTimeZones.find((z) => z.id === initial.timeZone)?.label ?? initial.timeZone;
  const summary = [zone, durationLabel(initial.duration), initial.language, initial.platform, registrationLabel[initial.registration]];

  return (
    <form
      ref={formRef}
      action={action}
      // Submit through a transition instead of the form action, so React does not clear
      // the fields when the server rejects them; the person keeps what they typed and chose.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      onReset={() => setPaid(initial.paid)}
      className="space-y-5"
    >
      <input type="hidden" name="slug" value={initial.slug} />

      <Field label="Title" error={errors.title}>
        <input name="title" defaultValue={initial.title} required maxLength={140} className="field" placeholder="e.g. Tafseer of Surah al-Asr" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" error={errors.date}>
          <input type="date" name="date" defaultValue={initial.date} required className="field" />
        </Field>
        <Field label="Start time" error={errors.time}>
          <input type="time" name="time" defaultValue={initial.time} required className="field" />
        </Field>
      </div>

      <fieldset>
        <legend className="text-[0.9375rem] font-medium">Admission</legend>
        <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-[3px] border border-[#b8ac96]">
          {[
            { value: "paid", label: "Paid", note: "PKR 500 / $2" },
            { value: "free", label: "Free", note: "Confirmed at once" },
          ].map((option, i) => (
            <label
              key={option.value}
              className={`flex cursor-pointer flex-col px-4 py-2.5 transition-colors has-[:checked]:bg-forest has-[:checked]:text-ivory has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/30 ${i ? "border-l border-[#b8ac96]" : ""}`}
            >
              <input
                type="radio"
                name="paid"
                value={option.value}
                defaultChecked={(option.value === "paid") === initial.paid}
                onChange={() => setPaid(option.value === "paid")}
                className="sr-only"
              />
              <span className="text-[0.9375rem] font-medium">{option.label}</span>
              <span className="text-[0.8125rem] opacity-75">{option.note}</span>
            </label>
          ))}
        </div>
        {paid && !paymentsLive ? (
          <p className="mt-2 text-[0.875rem] text-alert">
            Online payment is not connected yet, so nobody can register for a paid lecture. Choose Free for now.
          </p>
        ) : null}
      </fieldset>

      <Field label="Joining link" hint="Private, for confirmed registrants">
        <textarea
          name="instructions"
          defaultValue={initial.instructions}
          rows={2}
          className="field font-mono text-[0.875rem]"
          placeholder="https://zoom.us/j/…  Passcode: …"
        />
      </Field>

      <details open={moreHasError || undefined} className="group border-y border-line">
        <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
          <span className="shrink-0 text-[0.9375rem] font-medium">More options</span>
          <span className="min-w-0 truncate text-[0.8125rem] text-soft group-open:hidden">{summary.join(" · ")}</span>
          <span aria-hidden className="text-soft transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="grid grid-cols-2 gap-3 pb-5 pt-1">
          <Field label="Time zone" error={errors.timeZone}>
            <select name="timeZone" defaultValue={initial.timeZone} className="field">
              {lectureTimeZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Duration" error={errors.duration}>
            <select name="duration" defaultValue={String(initial.duration)} className="field">
              {durations.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {durationLabel(minutes)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Language" error={errors.language}>
            <input name="language" defaultValue={initial.language} required maxLength={40} className="field" list="languages" />
            <datalist id="languages">
              <option value="Urdu" />
              <option value="English" />
              <option value="Urdu and English" />
            </datalist>
          </Field>
          <Field label="Platform" error={errors.platform}>
            <input name="platform" defaultValue={initial.platform} required maxLength={40} className="field" list="platforms" />
            <datalist id="platforms">
              <option value="Zoom" />
              <option value="Google Meet" />
              <option value="YouTube Live" />
            </datalist>
          </Field>
          <Field label="Places" hint="Empty for no limit" error={errors.capacity}>
            <input name="capacity" defaultValue={initial.capacity} inputMode="numeric" className="field" />
          </Field>
          <Field label="Registration">
            <select name="registration" defaultValue={initial.registration} className="field">
              <option value="open">Open now</option>
              <option value="not-yet-open">Opens later</option>
              <option value="closed">Closed</option>
            </select>
          </Field>
          <Field label="Short description" hint="Optional" error={errors.description} className="col-span-2">
            <textarea name="description" defaultValue={initial.description} rows={2} maxLength={600} className="field" />
          </Field>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="button" disabled={pending} data-pending={pending}>
          {pending ? "Saving…" : editing ? "Save changes" : "Publish lecture"}
        </button>
        {editing ? (
          <Link href="/admin" className="link text-[0.9375rem] text-soft">
            Cancel
          </Link>
        ) : null}
      </div>
      {state.message ? (
        <p role="status" className={`text-[0.9375rem] ${state.ok ? "text-forest" : "text-alert"}`}>
          {state.message}
          {state.ok && state.slug ? (
            <>
              {" "}
              <Link href={`/lectures/${state.slug}`} className="link" target="_blank">
                View it
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[0.9375rem] font-medium">{label}</span>
        {hint ? <span className="truncate text-[0.8125rem] text-soft">{hint}</span> : null}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error ? <span className="mt-1.5 block text-[0.875rem] text-alert">{error}</span> : null}
    </label>
  );
}
