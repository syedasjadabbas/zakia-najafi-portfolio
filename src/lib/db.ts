import "server-only";

/**
 * Minimal database access.
 *
 * Production: PostgreSQL via DATABASE_URL (node-postgres).
 * Development without DATABASE_URL: an embedded PostgreSQL (PGlite) stored in
 * ./.data/pglite, so the same SQL runs everywhere.
 */

export type Row = Record<string, unknown>;
export type Query = <T extends Row = Row>(sql: string, params?: unknown[]) => Promise<T[]>;

type Db = {
  query: Query;
  transaction: <T>(fn: (query: Query) => Promise<T>) => Promise<T>;
};

const SCHEMA = `
create table if not exists registrations (
  id text primary key,
  lecture_slug text not null,
  name text not null,
  email text not null,
  status text not null check (status in
    ('pending_payment', 'pending_verification', 'confirmed', 'rejected', 'cancelled')),
  payment_method text not null check (payment_method in ('free', 'manual', 'stripe')),
  amount_minor integer,
  currency text,
  payment_reference text,
  stripe_session_id text unique,
  access_token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists registrations_one_active_per_email
  on registrations (lecture_slug, lower(email))
  where status not in ('rejected', 'cancelled');

create unique index if not exists registrations_unique_payment_reference
  on registrations (lower(payment_reference))
  where payment_reference is not null and status <> 'rejected';

-- Optional WhatsApp number, and payment methods for future gateways (additive).
alter table registrations add column if not exists whatsapp text;
alter table registrations drop constraint if exists registrations_payment_method_check;
alter table registrations add constraint registrations_payment_method_check
  check (payment_method in ('free', 'manual', 'stripe', 'jazzcash', 'easypaisa'));

create table if not exists lecture_access (
  lecture_slug text primary key,
  instructions text not null,
  updated_at timestamptz not null default now()
);

create table if not exists processed_payment_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- Lectures published from /admin (in addition to any in src/content/lectures.ts).
create table if not exists sign_in_attempts (
  key text primary key,
  failures integer not null,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
create table if not exists lectures (
  slug text primary key,
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 5 and 600),
  time_zone text not null,
  language text not null,
  platform text not null,
  paid boolean not null,
  capacity integer check (capacity is null or capacity > 0),
  registration_deadline timestamptz,
  registration text not null check (registration in ('open', 'closed', 'not-yet-open')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Per-lecture fees in whole rupees and US cents. Added after launch, so also applied to existing tables.
alter table lectures add column if not exists fee_pkr integer check (fee_pkr is null or fee_pkr > 0);
alter table lectures add column if not exists fee_usd_cents integer check (fee_usd_cents is null or fee_usd_cents > 0);
`;

declare global {
  var __zbnDb: Promise<Db> | undefined;
  var __zbnSchema: string | undefined;
}

async function createPostgres(url: string): Promise<Db> {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url, max: 5 });
  const query: Query = async (sql, params) => (await pool.query(sql, params)).rows;
  await pool.query(SCHEMA);
  return {
    query,
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await fn(async (sql, params) => (await client.query(sql, params)).rows);
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

async function createEmbedded(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = process.env.PGLITE_DATA_DIR ?? "./.data/pglite";
  if (dataDir !== "memory://") {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(dataDir, { recursive: true });
  }
  const pg = dataDir === "memory://" ? new PGlite() : new PGlite(dataDir);
  await pg.exec(SCHEMA);
  return {
    query: async (sql, params) => (await pg.query(sql, params)).rows as never,
    transaction: (fn) =>
      pg.transaction((tx) => fn(async (sql, params) => (await tx.query(sql, params)).rows as never)),
  };
}

export async function getDb(): Promise<Db> {
  if (!globalThis.__zbnDb) {
    globalThis.__zbnSchema = SCHEMA;
    globalThis.__zbnDb = (
      process.env.DATABASE_URL ? createPostgres(process.env.DATABASE_URL) : createEmbedded()
    ).catch((error) => {
      globalThis.__zbnDb = undefined; // allow a retry on the next request
      throw error;
    });
  }
  const db = await globalThis.__zbnDb;
  // A connection kept across code reloads (dev server) may predate a schema change: apply it.
  if (globalThis.__zbnSchema !== SCHEMA) {
    for (const statement of SCHEMA.split(";").filter((s) => s.trim())) await db.query(statement);
    globalThis.__zbnSchema = SCHEMA;
  }
  return db;
}

/** True when a Postgres unique constraint was violated. */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}
