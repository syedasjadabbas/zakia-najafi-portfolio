import { NextResponse, type NextRequest } from "next/server";
import { getLecture } from "@/content/lectures";

/**
 * Gives unknown lecture addresses a real 404 status. The lecture page streams,
 * and once streaming starts the status is fixed at 200, so the check has to
 * happen here, before the page renders.
 */
export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  const slug = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  if (await getLecture(slug)) return NextResponse.next();
  // No route matches this path, so Next.js renders app/not-found.tsx with a 404.
  return NextResponse.rewrite(new URL("/_lecture-not-found", request.url));
}

export const config = {
  matcher: "/lectures/:slug",
};
