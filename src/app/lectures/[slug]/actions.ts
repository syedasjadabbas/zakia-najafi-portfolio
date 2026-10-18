"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getLecture } from "@/content/lectures";
import { site } from "@/content/site";
import { sendEmail } from "@/lib/email";
import { formatDate, formatTime } from "@/lib/format";
import { createCheckoutSession, getPaymentProvider, isPaidRegistrationAvailable } from "@/lib/payments";
import {
  attachStripeSession,
  createRegistration,
  transitionRegistration,
  type PaymentMethod,
} from "@/lib/registrations";

export type RegisterState = {
  message?: string;
  errors?: Partial<Record<"name" | "email" | "reference", string>>;
  values?: { name: string; email: string; reference: string };
};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120, "Please shorten your name."),
  email: z.email("Please enter a valid email address.").trim().toLowerCase().max(200),
  reference: z.string().trim().max(120, "The reference is too long."),
});

export async function register(slug: string, _prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    reference: String(formData.get("reference") ?? ""),
  };

  // Honeypot: real visitors never fill this hidden field.
  if (formData.get("website")) return { message: "Your registration could not be submitted." };

  const lecture = await getLecture(slug);
  if (!lecture) return { message: "This lecture could not be found." };

  let method: PaymentMethod = "free";
  if (lecture.price) {
    if (!(await isPaidRegistrationAvailable())) {
      return { message: "Registration for this lecture is not available yet.", values: raw };
    }
    method = getPaymentProvider() === "stripe" ? "stripe" : "manual";
  }

  // Report every field problem in one pass.
  const parsed = schema.safeParse(raw);
  const errors: NonNullable<RegisterState["errors"]> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
  }
  if (method === "manual" && raw.reference.trim().length < 4) {
    errors.reference ??= "Please enter the transaction reference from your payment.";
  }
  if (!parsed.success || Object.keys(errors).length) return { errors, values: raw };

  const result = await createRegistration({
    lecture,
    name: parsed.data.name,
    email: parsed.data.email,
    method,
    paymentReference: method === "manual" ? parsed.data.reference : null,
  });

  if (!result.ok) {
    const message = {
      unavailable: "Registration for this lecture is no longer open.",
      duplicate:
        "This email address is already registered for this lecture. Please use the private link you received when you registered.",
      "reference-used": "This transaction reference has already been used for another registration.",
    }[result.reason];
    return { message, values: raw };
  }

  const statusUrl = `${site.url}/registration/${result.token}`;

  if (method === "stripe") {
    let checkoutUrl: string;
    try {
      const session = await createCheckoutSession({
        lecture,
        registrationId: result.id,
        email: parsed.data.email,
        returnUrl: statusUrl,
        cancelUrl: `${site.url}/lectures/${lecture.slug}`,
      });
      await attachStripeSession(result.id, session.id);
      checkoutUrl = session.url;
    } catch (error) {
      console.error("Stripe checkout failed", error);
      await transitionRegistration(result.id, ["pending_payment"], "cancelled");
      return { message: "The payment page could not be opened. Please try again shortly.", values: raw };
    }
    await sendRegistrationEmail(parsed.data.email, parsed.data.name, lecture.title, statusUrl, method);
    redirect(checkoutUrl);
  }

  await sendRegistrationEmail(parsed.data.email, parsed.data.name, lecture.title, statusUrl, method, {
    when: `${formatDate(lecture.startsAt, lecture.timeZone)}, ${formatTime(lecture.startsAt, lecture.timeZone)}`,
  });
  redirect(`/registration/${result.token}`);
}

async function sendRegistrationEmail(
  to: string,
  name: string,
  title: string,
  statusUrl: string,
  method: PaymentMethod,
  extra?: { when?: string },
) {
  const status = {
    free: "Your place is confirmed.",
    manual: "Your payment reference has been received and will be verified shortly.",
    stripe: "Your registration will be confirmed as soon as payment is complete.",
  }[method];
  await sendEmail({
    to,
    subject: `Registration: ${title}`,
    text: [
      `Assalamu alaikum ${name},`,
      "",
      `Thank you for registering for "${title}"${extra?.when ? ` on ${extra.when}` : ""}.`,
      status,
      "",
      "Your private registration page shows your status and, once confirmed, the joining instructions:",
      statusUrl,
      "",
      "Please keep this link to yourself — it gives access to your registration.",
      "",
      site.name,
    ].join("\n"),
  });
}
