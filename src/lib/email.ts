import "server-only";

/**
 * Transactional email via Resend (https://resend.com) when RESEND_API_KEY and
 * EMAIL_FROM are set. Without them, messages are written to the server log so
 * the flow still works in development; registrants always keep their private
 * status link on screen.
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(message: { to: string; subject: string; text: string }): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.info(`[email not configured] to=${message.to} subject="${message.subject}"`);
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, ...message }),
    });
    if (!response.ok) console.error(`Email failed: ${response.status} ${await response.text()}`);
    return response.ok;
  } catch (error) {
    console.error("Email failed", error);
    return false;
  }
}
