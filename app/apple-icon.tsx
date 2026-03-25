import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f9f8f2",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "40px",
          fontSize: 120,
          textShadow: "0 4px 10px rgba(0,0,0,0.08)",
        }}
      >
        🌸
      </div>
    ),
    { ...size }
  );
}