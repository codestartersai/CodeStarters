import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "#3b82f6",
          borderRadius: 8,
          color: "white",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        I
      </div>
    ),
    { ...size }
  );
}
