"use client";
// src/app/global-error.tsx
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          fontFamily: "Inter, Arial, sans-serif",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px 24px",
            maxWidth: "480px",
          }}
        >
          <p style={{ fontSize: "80px", margin: "0 0 8px", lineHeight: 1 }}>
            💥
          </p>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              margin: "0 0 12px",
              letterSpacing: "-0.5px",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: "15px", margin: "0 0 32px" }}>
            A critical error occurred. Our team has been notified.
            {error.digest && (
              <span
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#52525b",
                }}
              >
                Error ID: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#fafafa",
              color: "#09090b",
              border: "none",
              padding: "12px 28px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
