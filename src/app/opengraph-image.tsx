import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#09090b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: "#34d399" }} />
          <div style={{ width: 96, height: 40, borderRadius: 14, background: "#34d399" }} />
          <div style={{ width: 40, height: 40, borderRadius: 999, background: "#34d399" }} />
          <div style={{ width: 96, height: 40, borderRadius: 14, background: "#34d399" }} />
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#f4f4f5" }}>Learn Morse Code</div>
        <div style={{ fontSize: 32, color: "#a1a1aa" }}>
          Listen, browse the alphabet, and send it yourself
        </div>
      </div>
    ),
    { ...size }
  );
}
