"use server";

import { refresh } from "next/cache";
import { getLecture } from "@/content/lectures";
import { site } from "@/content/site";
import { checkPassword, endAdminSession, requireAdmin, startAdminSession } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
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

  if (!checkPassword(String(formData.get("password") ?? ""))) {
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
