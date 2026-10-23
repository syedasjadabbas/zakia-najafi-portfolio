"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { getLecture } from "@/content/lectures";
import { site } from "@/content/site";
import { sendEmail } from "@/lib/email";
import { formatDate, formatTime } from "@/lib/format";
import { getGateway } from "@/lib/payment-gateways";
import { getPaymentMethod, getPaymentRegion, paymentsComingSoonNotice } from "@/lib/payment-options";
import {
  createRegistration,
  deleteExpiredRegistrations,
  transitionRegistration,
  type PaymentMethod,
} from "@/lib/registrations";

export type RegisterState = {
  message?: string;
  errors?: Partial<Record<"name" | "email" | "whatsapp" | "region" | "method", string>>;
  values?: { name: string; email: string; whatsapp: string; region: string };
};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120, "Please shorten your name."),
  email: z.email("Please enter a valid email address.").trim().toLowerCase().max(200),
  whatsapp: z
    .string()
    .trim()
    .max(24, "Please check the WhatsApp number.")
    .refine((v) => v === "" || /^\+?[0-9][0-9\s-]{6,20}$/.test(v), "Please enter a valid WhatsApp number, or leave it empty."),
});

export async function register(slug: string, _prev: RegisterState, formData: FormData): Promise<RegisterState> {
  // After the response: remove registrations past the retention period in the privacy notice.
  after(() => deleteExpiredRegistrations().catch((error) => console.error("Retention cleanup failed", error)));
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    region: String(formData.get("region") ?? ""),
  };
  const methodId = String(formData.get("method") ?? "");

  // Honeypot: real visitors never fill this hidden field.
  if (formData.get("website")) return { message: "Your registration could not be submitted." };

  const lecture = await getLecture(slug);
  if (!lecture) return { message: "This lecture could not be found." };

  // Report every field problem in one pass.
  const parsed = schema.safeParse(raw);
  const errors: NonNullable<RegisterState["errors"]> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof errors;
      errors[key] ??= issue.message;
    }
  }

  // The lecture's own fees: the amount charged always comes from the server, never from the form.
  const region = lecture.paid ? getPaymentRegion(raw.region, lecture.fees) : undefined;
  if (lecture.paid && !region) errors.region = "Please choose where you are paying from.";
  if (!parsed.success || Object.keys(errors).length) return { errors, values: raw };

  const whatsapp = parsed.data.whatsapp.replace(/[\s-]/g, "") || null;

  // Free lectures: confirmed immediately, as before.
  if (!lecture.paid) {
    const result = await createRegistration({
      lecture,
      name: parsed.data.name,
      email: parsed.data.email,
      whatsapp,
      method: "free",
      paymentReference: null,
    });
    if (!result.ok) return { message: failureMessage(result.reason), values: raw };
    const statusUrl = `${site.url}/registration/${result.token}`;
    await sendRegistrationEmail(parsed.data.email, parsed.data.name, lecture.title, statusUrl, "free", {
      when: `${formatDate(lecture.startsAt, lecture.timeZone)}, ${formatTime(lecture.startsAt, lecture.timeZone)}`,
    });
    redirect(`/registration/${result.token}`);
  }

  // Paid lectures: only through a live, configured gateway. Nothing is ever
  // confirmed here; the gateway's verified callback does that.
  const method = region ? getPaymentMethod(region, methodId) : undefined;
  const gateway = method ? getGateway(method.id) : null;
  if (!region || !gateway) return { message: paymentsComingSoonNotice, values: raw };

  const result = await createRegistration({
    lecture,
    name: parsed.data.name,
    email: parsed.data.email,
    whatsapp,
    method: gateway.storedAs,
    fee: region.fee,
    paymentReference: null,
  });
  if (!result.ok) return { message: failureMessage(result.reason), values: raw };

  const statusUrl = `${site.url}/registration/${result.token}`;
  let redirectUrl: string;
  try {
    ({ redirectUrl } = await gateway.startCheckout({
      registrationId: result.id,
      lecture,
      fee: region.fee,
      name: parsed.data.name,
      email: parsed.data.email,
      returnUrl: statusUrl,
      cancelUrl: `${site.url}/lectures/${lecture.slug}`,
    }));
  } catch (error) {
    console.error(`Checkout failed (${gateway.id})`, error);
    await transitionRegistration(result.id, ["pending_payment"], "cancelled");
    return { message: "The payment page could not be opened. Please try again shortly.", values: raw };
  }
  await sendRegistrationEmail(parsed.data.email, parsed.data.name, lecture.title, statusUrl, gateway.storedAs);
  redirect(redirectUrl);
}

function failureMessage(reason: "unavailable" | "duplicate" | "reference-used") {
  return {
    unavailable: "Registration for this lecture is no longer open.",
    duplicate:
      "This email address is already registered for this lecture. Please use the private link you received when you registered.",
    "reference-used": "This payment reference has already been used for another registration.",
  }[reason];
}

async function sendRegistrationEmail(
  to: string,
  name: string,
  title: string,
  statusUrl: string,
  method: PaymentMethod,
  extra?: { when?: string },
) {
  const status =
    method === "free"
      ? "Your place is confirmed."
      : method === "manual"
        ? "Your payment reference has been received and will be verified shortly."
        : "Your registration will be confirmed as soon as your payment is verified.";
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
      "Please keep this link to yourself, as it gives access to your registration.",
      "",
      site.name,
    ].join("\n"),
  });
}
