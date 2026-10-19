import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/*
 * Social share image (1200×630). The right panel (src/app/_og/panel.jpg) is
 * composed from the hero background and her real portrait cut-out; nothing in
 * it is newly generated.
 */

export const alt = `${site.name}, ${site.qualification}. Islamic lectures, Hawzah courses and Tafseer classes.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dataUri = (data: Buffer, type: string) => `data:${type};base64,${data.toString("base64")}`;

export default async function OpenGraphImage() {
  const [serif, serifItalic, sans, mark, panel] = await Promise.all([
    // Literal paths, so only these files are traced into the server bundle.
    readFile(join(process.cwd(), "src/app/_fonts/newsreader-400.woff")),
    readFile(join(process.cwd(), "src/app/_fonts/newsreader-400-italic.woff")),
    readFile(join(process.cwd(), "src/app/_fonts/plex-sans-400.woff")),
    readFile(join(process.cwd(), "public/brand/zb-mark-on-light.png")),
    readFile(join(process.cwd(), "src/app/_og/panel.jpg")),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f8f4ec", color: "#1e1d1a" }}>
        <div
          style={{
            width: 640,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 40px 0 76px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse */}
          <img src={dataUri(mark, "image/png")} width={86} height={72} alt="" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 34,
              fontFamily: "Newsreader",
              fontSize: 84,
              lineHeight: 0.98,
              letterSpacing: -2,
            }}
          >
            <span>Zakia Batool</span>
            <span style={{ fontStyle: "italic", color: "#1f3d2e" }}>Najafi</span>
          </div>
          <div style={{ display: "flex", marginTop: 30, fontFamily: "Newsreader", fontSize: 32 }}>
            {site.qualification}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontFamily: "Plex", fontSize: 24, lineHeight: 1.45, color: "#4a453d" }}>
            Islamic lectures and majalis, Hawzah courses and Tafseer classes
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse */}
        <img src={dataUri(panel, "image/jpeg")} width={560} height={630} alt="" />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, weight: 400, style: "normal" },
        { name: "Newsreader", data: serifItalic, weight: 400, style: "italic" },
        { name: "Plex", data: sans, weight: 400, style: "normal" },
      ],
    },
  );
}
