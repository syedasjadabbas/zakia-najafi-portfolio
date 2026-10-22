"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getLecture, getLectures } from "@/content/lectures";
import { site } from "@/content/site";
import {
  checkPassword,
  endAdminSession,
  MIN_PASSWORD_LENGTH,
  requireAdmin,
  setAdminPassword,
  startAdminSession,
} from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import { lectureTimeZones } from "@/lib/lecture-time-zones";
import {
  deleteStoredLecture,
  getStoredLecture,
  saveStoredLecture,
  setStoredLectureRegistration,
  uniqueSlug,
  zonedTimeToIso,
} from "@/lib/lecture-store";
import { getRegistration, setAccessInstructions, transitionRegistration } from "@/lib/registrations";

export type LoginState = { error?: string };

const failedAttempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const key = "admin";
  const now = Date.now();
  const record = failedAttempts.get(key);
  if (record && record.until > now) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  if (!(await checkPassword(String(formData.get("password") ?? "")))) {
    const count = (record?.count ?? 0) + 1;
    failedAttempts.set(key, { count, until: count >= 5 ? now + 5 * 60_000 : 0 });
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "That password is not correct." };
  }

  failedAttempts.delete(key);
  await startAdminSession();
  refresh();
  return {};
}

export type PasswordState = {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<"current" | "next" | "confirm", string>>;
};

export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const key = "admin";
  const now = Date.now();
  const record = failedAttempts.get(key);
  if (record && record.until > now) {
    return { message: "Too many attempts. Please wait a few minutes and try again." };
  }
  if (!(await checkPassword(current))) {
    const count = (record?.count ?? 0) + 1;
    failedAttempts.set(key, { count, until: count >= 5 ? now + 5 * 60_000 : 0 });
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { errors: { current: "That is not the current password." } };
  }

  if (next.length < MIN_PASSWORD_LENGTH) {
    return { errors: { next: `Use at least ${MIN_PASSWORD_LENGTH} characters.` } };
  }
  if (next.length > 200) return { errors: { next: "Please use a shorter password." } };
  if (next === current) return { errors: { next: "Choose a password different from the current one." } };
  if (next !== confirm) return { errors: { confirm: "The two new passwords do not match." } };

  failedAttempts.delete(key);
  await setAdminPassword(next);
  await startAdminSession(); // keep this device signed in; every other device is signed out
  return { ok: true, message: "Password changed. Use the new password next time you sign in." };
}

export async function logout() {
  await endAdminSession();
  refresh();
}

export async function approveRegistration(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  if (await transitionRegistration(id, ["pending_verification", "rejected"], "confirmed")) {
    await notify(id, "confirmed");
  }
  refresh();
}

export async function rejectRegistration(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  if (await transitionRegistration(id, ["pending_verification", "confirmed"], "rejected")) {
    await notify(id, "rejected");
  }
  refresh();
}

export async function saveAccessInstructions(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  if (!(await getLecture(slug))) throw new Error("Unknown lecture");
  await setAccessInstructions(slug, String(formData.get("instructions") ?? "").slice(0, 4000));
  refresh();
}

async function notify(id: string, outcome: "confirmed" | "rejected") {
  const registration = await getRegistration(id);
  if (!registration) return;
  const lecture = await getLecture(registration.lecture_slug);
  const title = lecture?.title ?? "your lecture";
  await sendEmail({
    to: registration.email,
    subject: outcome === "confirmed" ? `Confirmed: ${title}` : `Registration update: ${title}`,
    text: [
      `Assalamu alaikum ${registration.name},`,
      "",
      outcome === "confirmed"
        ? `Your payment has been verified and your place for "${title}" is confirmed. The joining instructions are on your private registration page — use the link you received when you registered.`
        : `We were unable to verify the payment for your registration for "${title}", so it has not been confirmed. If you believe this is a mistake, please reply with your payment details.`,
      "",
      site.name,
    ].join("\n"),
  });
}

/* ---------- Lectures published from the admin panel ---------- */

export type LectureFormState = {
  ok?: boolean;
  message?: string;
  slug?: string;
  errors?: Partial<Record<"title" | "description" | "date" | "time" | "duration" | "capacity" | "timeZone" | "language" | "platform", string>>;
};

const lectureSchema = z.object({
  slug: z.string().trim().max(120),
  title: z.string().trim().min(3, "Please enter a title.").max(140, "Please shorten the title."),
  description: z.string().trim().max(600, "Please keep the description under 600 characters."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a start time."),
  timeZone: z.enum(lectureTimeZones.map((zone) => zone.id) as [string, ...string[]], { message: "Please choose a time zone." }),
  duration: z.coerce.number().int().min(5, "Please choose a duration.").max(600),
  language: z.string().trim().min(1).max(40),
  platform: z.string().trim().min(1).max(40),
  paid: z.enum(["paid", "free"]),
  capacity: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) > 0), "Use a whole number, or leave it empty."),
  registration: z.enum(["open", "not-yet-open", "closed"]),
  instructions: z.string().max(4000),
});

export async function saveLecture(_prev: LectureFormState, formData: FormData): Promise<LectureFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(
    ["slug", "title", "description", "date", "time", "timeZone", "duration", "language", "platform", "paid", "capacity", "registration", "instructions"].map(
      (key) => [key, String(formData.get(key) ?? "")],
    ),
  );
  const parsed = lectureSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: NonNullable<LectureFormState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
    return { errors, message: "Please check the highlighted fields." };
  }
  const data = parsed.data;
  const startsAt = zonedTimeToIso(data.date, data.time, data.timeZone);
  if (!startsAt) return { errors: { date: "Please check the date and time." } };

  // Editing keeps the original address, so links already shared keep working.
  let slug = data.slug;
  if (slug) {
    if (!(await getStoredLecture(slug))) return { message: "This lecture could not be found." };
  } else {
    const taken = (await getLectures()).map((l) => l.slug);
    slug = uniqueSlug(data.title, startsAt, taken);
  }

  await saveStoredLecture({
    slug,
    title: data.title,
    description: data.description,
    startsAt,
    durationMinutes: data.duration,
    timeZone: data.timeZone,
    language: data.language,
    platform: data.platform,
    paid: data.paid === "paid",
    capacity: data.capacity ? Number(data.capacity) : undefined,
    registration: data.registration,
  });
  if (data.instructions.trim() || data.slug) await setAccessInstructions(slug, data.instructions);

  refresh();
  return {
    ok: true,
    slug,
    message: data.slug ? "Saved. The website is updated." : "Published. The lecture is now live on the website.",
  };
}

export async function setLectureRegistration(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  const registration = String(formData.get("registration"));
  if (!["open", "closed", "not-yet-open"].includes(registration)) throw new Error("Invalid status");
  if (!(await getStoredLecture(slug))) throw new Error("Unknown lecture");
  await setStoredLectureRegistration(slug, registration as "open" | "closed" | "not-yet-open");
  refresh();
}

export async function deleteLecture(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  if (!(await getStoredLecture(slug))) throw new Error("Unknown lecture");
  if (!(await deleteStoredLecture(slug))) {
    throw new Error("People have registered for this lecture, so it can't be deleted. Close registration instead.");
  }
  refresh();
}
