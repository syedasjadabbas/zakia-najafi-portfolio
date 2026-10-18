import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.qualification}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [serif, sans, mark] = await Promise.all([
    readFile(join(process.cwd(), "src/app/_fonts/newsreader-400.woff")),
    readFile(join(process.cwd(), "src/app/_fonts/plex-sans-400.woff")),
    readFile(join(process.cwd(), "public/brand/zb-mark-on-light.png")),
  ]);
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "88px 96px",
          background: "#f6f3ec",
          color: "#1d1c19",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse */}
        <img src={markSrc} width={118} height={99} alt="" style={{ marginBottom: 44 }} />
        <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: 92, lineHeight: 1.02, letterSpacing: -1.5 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", fontFamily: "Plex", fontSize: 30, color: "#5d5950", marginTop: 24 }}>
          {`${site.qualification} · Lectures, Hawzah courses and Tafseer`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, weight: 400, style: "normal" },
        { name: "Plex", data: sans, weight: 400, style: "normal" },
      ],
    },
  );
}
