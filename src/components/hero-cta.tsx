import Link from "next/link";
import { Suspense } from "react";
import { getLecturesWithStatus } from "@/lib/lecture-data";
import { ArrowRightIcon } from "./icons";

const buttonClass = "button min-h-[3.25rem] px-6 text-[1rem] md:text-[1.0625rem]";

/** Shown until lecture data arrives, and whenever no lecture is open. */
function UpcomingButton() {
  return (
    <Link href="#lectures" className={buttonClass}>
      Register for live lectures
      <ArrowRightIcon className="arrow" />
    </Link>
  );
}

/**
 * The hero's primary call to action. When a lecture is open for registration
 * it goes straight to that lecture's registration page.
 */
async function NextLectureButton() {
  const next = (await getLecturesWithStatus()).find((item) => item.status === "open");
  if (!next) return <UpcomingButton />;
  const { lecture } = next;
  return (
    <Link href={`/lectures/${lecture.slug}`} className={buttonClass}>
      Register for live lectures
      <span className="sr-only">: {lecture.title}</span>
      <ArrowRightIcon className="arrow" />
    </Link>
  );
}

export function HeroCta() {
  return (
    <Suspense fallback={<UpcomingButton />}>
      <NextLectureButton />
    </Suspense>
  );
}
