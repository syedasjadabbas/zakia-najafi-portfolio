import "server-only";

import type { Lecture, Price } from "@/content/lectures";
import { getDb, isUniqueViolation, type Query } from "./db";
import { getLectureStatus } from "./lecture-status";
import { retentionCutoff } from "./retention";
import { createAccessToken, hashToken, newId } from "./tokens";

export type RegistrationStatus =
  | "pending_payment"
  | "pending_verification"
  | "confirmed"
  | "rejected"
  | "cancelled";

export type PaymentMethod = "free" | "manual" | "stripe" | "jazzcash" | "easypaisa";

export type Registration = {
  id: string;
  lecture_slug: string;
  name: string;
  email: string;
  status: RegistrationStatus;
  payment_method: PaymentMethod;
  whatsapp: string | null;
  amount_minor: number | null;
  currency: string | null;
  payment_reference: string | null;
  stripe_session_id: string | null;
  created_at: Date;
  updated_at: Date;
};

const COLUMNS = `id, lecture_slug, name, email, whatsapp, status, payment_method, amount_minor, currency,
  payment_reference, stripe_session_id, created_at, updated_at`;

/** Statuses that hold a place. */
const HOLDS_PLACE = `status in ('pending_payment', 'pending_verification', 'confirmed')`;

export async function getPlacesTaken(): Promise<Map<string, number>> {
  const db = await getDb();
  const rows = await db.query<{ lecture_slug: string; n: number }>(
    `select lecture_slug, count(*)::int as n from registrations where ${HOLDS_PLACE} group by lecture_slug`,
  );
  return new Map(rows.map((r) => [r.lecture_slug, Number(r.n)]));
}

export type CreateResult =
  | { ok: true; id: string; token: string; status: RegistrationStatus }
  | { ok: false; reason: "unavailable" | "duplicate" | "reference-used" };

export async function createRegistration(input: {
  lecture: Lecture;
  name: string;
  email: string;
  method: PaymentMethod;
  paymentReference: string | null;
  /** The fee charged (from the payment region chosen); null for free lectures. */
  fee?: Price | null;
  whatsapp?: string | null;
  now?: Date;
}): Promise<CreateResult> {
  const { lecture, method } = input;
  const fee = input.fee ?? null;
  // A paid lecture can never be registered for free, and a free one never charges.
  if (lecture.paid !== (method !== "free") || lecture.paid !== Boolean(fee)) {
    return { ok: false, reason: "unavailable" };
  }
  const db = await getDb();
  const token = createAccessToken();
  const id = newId();
  const status: RegistrationStatus =
    method === "free" ? "confirmed" : method === "manual" ? "pending_verification" : "pending_payment";

  try {
    return await db.transaction(async (q) => {
      // Serialise registrations per lecture so capacity cannot be exceeded.
      await q(`select pg_advisory_xact_lock(hashtext($1))`, [lecture.slug]);
      const [{ n }] = await q<{ n: number }>(
        `select count(*)::int as n from registrations where lecture_slug = $1 and ${HOLDS_PLACE}`,
        [lecture.slug],
      );
      if (getLectureStatus(lecture, input.now ?? new Date(), Number(n)) !== "open") {
        return { ok: false, reason: "unavailable" } as const;
      }
      await q(
        `insert into registrations
          (id, lecture_slug, name, email, whatsapp, status, payment_method, amount_minor, currency,
           payment_reference, access_token_hash)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id,
          lecture.slug,
          input.name,
          input.email,
          input.whatsapp ?? null,
          status,
          method,
          fee?.amount ?? null,
          fee?.currency ?? null,
          input.paymentReference,
          hashToken(token),
        ],
      );
      return { ok: true, id, token, status } as const;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const detail = String((error as { constraint?: string }).constraint ?? (error as Error).message);
      return {
        ok: false,
        reason: detail.includes("payment_reference") ? "reference-used" : "duplicate",
      };
    }
    throw error;
  }
}

export async function getRegistrationByToken(token: string): Promise<Registration | null> {
  if (!token || token.length > 100) return null;
  const db = await getDb();
  const rows = await db.query<Registration>(
    `select ${COLUMNS} from registrations where access_token_hash = $1`,
    [hashToken(token)],
  );
  return rows[0] ?? null;
}

export async function getRegistration(id: string): Promise<Registration | null> {
  const db = await getDb();
  const rows = await db.query<Registration>(`select ${COLUMNS} from registrations where id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listRegistrations(): Promise<Registration[]> {
  const db = await getDb();
  return db.query<Registration>(
    `select ${COLUMNS} from registrations
     order by case status when 'pending_verification' then 0 else 1 end, created_at desc
     limit 500`,
  );
}

/**
 * Deletes registrations older than the retention period stated in the privacy
 * notice. Cheap to call often; returns how many were removed.
 */
export async function deleteExpiredRegistrations(now: Date = new Date()): Promise<number> {
  const db = await getDb();
  const rows = await db.query<{ id: string }>(`delete from registrations where created_at < $1 returning id`, [
    retentionCutoff(now).toISOString(),
  ]);
  return rows.length;
}

/** Moves a registration between statuses only if it is currently in one of `from`. */
export async function transitionRegistration(
  id: string,
  from: RegistrationStatus[],
  to: RegistrationStatus,
  query?: Query,
): Promise<boolean> {
  const q = query ?? (await getDb()).query;
  const rows = await q(
    `update registrations set status = $2, updated_at = now()
     where id = $1 and status = any($3::text[]) returning id`,
    [id, to, from],
  );
  return rows.length === 1;
}

export async function attachStripeSession(id: string, sessionId: string): Promise<void> {
  const db = await getDb();
  await db.query(`update registrations set stripe_session_id = $2, updated_at = now() where id = $1`, [
    id,
    sessionId,
  ]);
}

/**
 * Applies a verified payment-provider event exactly once. Returns false when
 * the event was already processed.
 */
export async function applyPaymentEvent(
  eventId: string,
  apply: (query: Query) => Promise<void>,
): Promise<boolean> {
  const db = await getDb();
  return db.transaction(async (q) => {
    const inserted = await q(
      `insert into processed_payment_events (event_id) values ($1) on conflict do nothing returning event_id`,
      [eventId],
    );
    if (inserted.length === 0) return false;
    await apply(q);
    return true;
  });
}

export async function findByStripeSession(sessionId: string, query: Query): Promise<Registration | null> {
  const rows = await query<Registration>(
    `select ${COLUMNS} from registrations where stripe_session_id = $1`,
    [sessionId],
  );
  return rows[0] ?? null;
}

export async function getAccessInstructions(slug: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.query<{ instructions: string }>(
    `select instructions from lecture_access where lecture_slug = $1`,
    [slug],
  );
  return rows[0]?.instructions ?? null;
}

export async function getAllAccessInstructions(): Promise<Map<string, string>> {
  const db = await getDb();
  const rows = await db.query<{ lecture_slug: string; instructions: string }>(
    `select lecture_slug, instructions from lecture_access`,
  );
  return new Map(rows.map((r) => [r.lecture_slug, r.instructions]));
}

export async function setAccessInstructions(slug: string, instructions: string): Promise<void> {
  const db = await getDb();
  if (!instructions.trim()) {
    await db.query(`delete from lecture_access where lecture_slug = $1`, [slug]);
    return;
  }
  await db.query(
    `insert into lecture_access (lecture_slug, instructions) values ($1, $2)
     on conflict (lecture_slug) do update set instructions = excluded.instructions, updated_at = now()`,
    [slug, instructions],
  );
}
