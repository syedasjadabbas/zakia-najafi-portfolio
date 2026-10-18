import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Placeholder monogram until approved branding is supplied.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const serif = await readFile(join(process.cwd(), "src/app/_fonts/newsreader-400.woff"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#46512f",
          color: "#f6f3ec",
          fontFamily: "Newsreader",
          fontSize: 46,
          paddingBottom: 4,
        }}
      >
        Z
      </div>
    ),
    { ...size, fonts: [{ name: "Newsreader", data: serif, weight: 400, style: "normal" }] },
  );
}
