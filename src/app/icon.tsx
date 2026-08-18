import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// The favicon is the app's whole visual identity distilled to its
// smallest unit: a dot and a dash, rendered as plain shapes (no font
// dependency) so it stays crisp at any size.
export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ width: 5, height: 5, borderRadius: 999, background: "#34d399" }} />
          <div style={{ width: 12, height: 5, borderRadius: 2, background: "#34d399" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
