/**
 * How long registration details are kept. The privacy notice quotes this number,
 * and deleteExpiredRegistrations() enforces it, so the two always agree.
 */
export const RETENTION_MONTHS = 12;

/** Registrations made before this moment are past the retention period. */
export function retentionCutoff(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - RETENTION_MONTHS);
  return cutoff;
}
