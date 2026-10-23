import "server-only";

import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDb } from "./db";

/**
 * Single-administrator authentication.
 * ADMIN_PASSWORD is the first login password. Once the administrator changes it
 * from the admin panel, a scrypt hash of the new one is kept in the database and
 * takes over; ADMIN_PASSWORD then no longer works.
 * SESSION_SECRET signs the session cookie. The cookie holds only an expiry time,
 * a short fingerprint of the current password and its HMAC — no password material.
 * Changing the password changes the fingerprint, which signs out every other device.
 */

const COOKIE = "zbn_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;
const PASSWORD_KEY = "password_hash";
export const MIN_PASSWORD_LENGTH = 10;

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

function secret(): string | null {
  const value = process.env.SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/* ---------- Stored password ---------- */

async function storedHash(): Promise<string | null> {
  const db = await getDb();
  const rows = await db.query<{ value: string }>(`select value from admin_settings where key = $1`, [PASSWORD_KEY]);
  return rows[0]?.value ?? null;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

async function verifyHash(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** Identifies the current password without revealing it, so sessions end when it changes. */
async function passwordFingerprint(): Promise<string | null> {
  const key = secret();
  const current = (await storedHash()) ?? process.env.ADMIN_PASSWORD;
  if (!key || !current) return null;
  return sign(`password:${current}`, key).slice(0, 16);
}

export async function checkPassword(candidate: string): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const stored = await storedHash();
  if (stored) return verifyHash(candidate, stored);
  return safeEqual(candidate, process.env.ADMIN_PASSWORD!);
}

/** Replaces the login password. The caller must have checked the current one. */
export async function setAdminPassword(password: string): Promise<void> {
  const db = await getDb();
  await db.query(
    `insert into admin_settings (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [PASSWORD_KEY, await hashPassword(password)],
  );
}

/* ---------- Failed sign-in attempts ---------- */
// Kept in the database so the limit holds across every server instance and restart.

const ATTEMPTS_KEY = "admin";
export const MAX_FAILURES = 5;
const LOCK_MINUTES = 5;
const WINDOW_MINUTES = 15; // failures older than this are forgotten

/** True while sign-in (and password changes) are paused after too many wrong passwords. */
export async function isLockedOut(): Promise<boolean> {
  const db = await getDb();
  const rows = await db.query<{ locked: boolean }>(
    `select locked_until > now() as locked from sign_in_attempts where key = $1`,
    [ATTEMPTS_KEY],
  );
  return Boolean(rows[0]?.locked);
}

/** Counts a wrong password; the fifth within the window pauses sign-in for a few minutes. */
export async function recordFailedSignIn(): Promise<void> {
  const db = await getDb();
  const failures = `case when sign_in_attempts.updated_at < now() - interval '${WINDOW_MINUTES} minutes'
                      then 1 else sign_in_attempts.failures + 1 end`;
  await db.query(
    `insert into sign_in_attempts (key, failures) values ($1, 1)
     on conflict (key) do update set
       failures = ${failures},
       locked_until = case when ${failures} >= ${MAX_FAILURES}
                        then now() + interval '${LOCK_MINUTES} minutes' else sign_in_attempts.locked_until end,
       updated_at = now()`,
    [ATTEMPTS_KEY],
  );
}

export async function clearFailedSignIns(): Promise<void> {
  const db = await getDb();
  await db.query(`delete from sign_in_attempts where key = $1`, [ATTEMPTS_KEY]);
}

/* ---------- Session ---------- */

export async function startAdminSession(): Promise<void> {
  const key = secret();
  const fingerprint = await passwordFingerprint();
  if (!key || !fingerprint) throw new Error("Administration is not configured");
  const payload = `${Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS}.${fingerprint}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const key = secret();
  if (!key || !process.env.ADMIN_PASSWORD) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, fingerprint, signature] = value.split(".");
  if (!expires || !fingerprint || !signature) return false;
  if (!safeEqual(signature, sign(`${expires}.${fingerprint}`, key))) return false;
  if (Number(expires) * 1000 <= Date.now()) return false;
  const current = await passwordFingerprint();
  return current !== null && safeEqual(fingerprint, current);
}

/** Call at the top of every admin Server Action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not authorised");
}
