"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
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

/** Publish a new lecture, or edit one, from the admin panel. Works on a phone. */
export function LectureForm({ initial }: { initial: LectureFormValues }) {
  const editing = Boolean(initial.slug);
  const [state, action, pending] = useActionState<LectureFormState, FormData>(saveLecture, {});
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.errors ?? {};

  // A new lecture: clear the form after publishing so the next one starts fresh.
  useEffect(() => {
    if (state.ok && !editing) formRef.current?.reset();
  }, [state, editing]);

  return (
    <form ref={formRef} action={action} className="mt-6 grid gap-5 md:grid-cols-2">
      <input type="hidden" name="slug" value={initial.slug} />

      <Field label="Title" error={errors.title} className="md:col-span-2">
        <input name="title" defaultValue={initial.title} required maxLength={140} className="field" placeholder="e.g. Tafseer of Surah al-Asr" />
      </Field>

      <Field label="Short description" hint="Optional. One or two sentences." error={errors.description} className="md:col-span-2">
        <textarea name="description" defaultValue={initial.description} rows={2} maxLength={600} className="field" />
      </Field>

      <Field label="Date" error={errors.date}>
        <input type="date" name="date" defaultValue={initial.date} required className="field" />
      </Field>
      <Field label="Start time" error={errors.time}>
        <input type="time" name="time" defaultValue={initial.time} required className="field" />
      </Field>

      <Field label="Time zone" hint="The time above is in this zone." error={errors.timeZone}>
        <select name="timeZone" defaultValue={initial.timeZone} className="field">
          {lectureTimeZones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Duration" error={errors.duration}>
        <select name="duration" defaultValue={String(initial.duration)} className="field">
          {durations.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ""}`}
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

      <Field label="Admission">
        <select name="paid" defaultValue={initial.paid ? "paid" : "free"} className="field">
          <option value="paid">Paid (PKR 500 / USD $2)</option>
          <option value="free">Free</option>
        </select>
      </Field>
      <Field label="Places available" hint="Optional. Leave empty for no limit." error={errors.capacity}>
        <input name="capacity" defaultValue={initial.capacity} inputMode="numeric" className="field" />
      </Field>

      <Field label="Registration" className="md:col-span-2">
        <select name="registration" defaultValue={initial.registration} className="field">
          <option value="open">Open now</option>
          <option value="not-yet-open">Announced, opens later</option>
          <option value="closed">Closed</option>
        </select>
      </Field>

      <Field
        label="Joining link and details"
        hint="Private. Shown only to people whose registration is confirmed (paid, or free lectures). You can add it later."
        className="md:col-span-2"
      >
        <textarea
          name="instructions"
          defaultValue={initial.instructions}
          rows={3}
          className="field font-mono text-[0.9375rem]"
          placeholder="https://zoom.us/j/…  Passcode: …"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <button type="submit" className="button" disabled={pending} data-pending={pending}>
          {pending ? "Saving…" : editing ? "Save changes" : "Publish lecture"}
        </button>
        {editing ? (
          <Link href="/admin#lectures-admin" className="link text-[0.9375rem] text-soft">
            Cancel
          </Link>
        ) : null}
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
      </div>
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
    <label className={`block ${className}`}>
      <span className="block text-[0.9375rem] font-medium">{label}</span>
      {hint ? <span className="mt-0.5 block text-[0.875rem] text-soft">{hint}</span> : null}
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-1.5 block text-[0.875rem] text-alert">{error}</span> : null}
    </label>
  );
}
