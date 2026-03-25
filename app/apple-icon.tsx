import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #FFC2D4 0%, #F4A7CB 30%, #E8A5D5 65%, #C9A7EB 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "40px",
          fontSize: 120,
        }}
      >
        🌸
      </div>
    ),
    { ...size }
  );
}
