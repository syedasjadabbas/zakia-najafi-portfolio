import type { SVGProps } from "react";
import { brandPaths } from "./brand-paths";

/** Thin line icons drawn on a 24px grid, inheriting the current text colour. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Line({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const BookOpenIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 6.5C10.2 5 7.6 4.5 3.5 4.8v13.4c4.1-.3 6.7.2 8.5 1.8 1.8-1.6 4.4-2.1 8.5-1.8V4.8c-4.1-.3-6.7.2-8.5 1.7Z" />
    <path d="M12 6.5V20" />
  </Line>
);

export const BookTextIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M5 3.5h11.5a2 2 0 0 1 2 2V20.5H7a2 2 0 0 1-2-2v-15Z" />
    <path d="M5 18.5a2 2 0 0 1 2-2h11.5" />
    <path d="M9 7.5h6M9 10.5h6M9 13.5h3.5" />
  </Line>
);

export const QuranIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M3.5 7.5 12 10l8.5-2.5v10L12 20l-8.5-2.5v-10Z" />
    <path d="M12 10v10" />
    <path d="M7 4.5c2 0 3.6.6 5 1.8 1.4-1.2 3-1.8 5-1.8" />
  </Line>
);

export const PeopleIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="8.5" cy="8" r="3" />
    <circle cx="16.5" cy="9" r="2.5" />
    <path d="M3 19.5c.4-3.2 2.6-5 5.5-5s5.1 1.8 5.5 5" />
    <path d="M14.5 14.6c.6-.3 1.3-.4 2-.4 2.4 0 4.2 1.5 4.5 4.3" />
  </Line>
);

export const MortarboardIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Z" />
    <path d="M6.5 11v4.5c1.5 1.4 3.4 2 5.5 2s4-.6 5.5-2V11" />
    <path d="M21.5 9v5" />
  </Line>
);

export const PinIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Line>
);

export const ClockIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Line>
);

export const HourglassIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M6.5 3.5h11M6.5 20.5h11" />
    <path d="M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5s-4.5 4-4.5 8.5M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5" />
  </Line>
);

export const ScreenIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
    <path d="M9 20h6M12 16.5V20" />
  </Line>
);

export const GlobeIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z" />
  </Line>
);

export const MailIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Line>
);

export const ArrowRightIcon = ({ size = 16, ...p }: IconProps) => (
  <Line size={size} strokeWidth={1.6} {...p}>
    <path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />
  </Line>
);

export function PlayIcon({ size = 14, ...p }: IconProps) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 14 14" fill="currentColor" {...p}>
      <path d="M3 1.5v11l9.5-5.5L3 1.5Z" />
    </svg>
  );
}

const brandColour: Record<string, { bg: string; fg: string }> = {
  YouTube: { bg: "#ff0000", fg: "#ffffff" },
  Instagram: { bg: "linear-gradient(45deg,#f9a33f 0%,#e1306c 50%,#833ab4 100%)", fg: "#ffffff" },
  Facebook: { bg: "#1877f2", fg: "#ffffff" },
  X: { bg: "#111111", fg: "#ffffff" },
  Threads: { bg: "#111111", fg: "#ffffff" },
};

/** Official brand mark in a circle. `tone="mono"` renders it in the current colour. */
export function BrandIcon({
  name,
  size = 40,
  tone = "brand",
}: {
  name: string;
  size?: number;
  tone?: "brand" | "mono";
}) {
  const path = brandPaths[name];
  if (!path) return null;
  const colours = brandColour[name];
  const glyph = Math.round(size * 0.48);
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: tone === "brand" ? colours?.bg : undefined,
        color: tone === "brand" ? colours?.fg : undefined,
      }}
    >
      <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
      </svg>
    </span>
  );
}
