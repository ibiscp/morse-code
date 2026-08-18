import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
// Render once at build time so the icon ships with the static export.
export const dynamic = "force-static";

// Same dot-and-dash mark as icon.tsx, scaled up for iOS home screens.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: "#34d399" }} />
          <div style={{ width: 64, height: 28, borderRadius: 10, background: "#34d399" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
