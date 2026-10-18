import { cacheLife } from "next/cache";

/** Cached for a day, so the static shell never keeps a stale year for long. */
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
