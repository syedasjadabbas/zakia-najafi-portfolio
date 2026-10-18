import { createHash, randomBytes, randomUUID } from "node:crypto";

/** Unguessable bearer token for a registrant's private status page. */
export function createAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only the hash is stored, so a database leak does not expose access links. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newId(): string {
  return randomUUID();
}
