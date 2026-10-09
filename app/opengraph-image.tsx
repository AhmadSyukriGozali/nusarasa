import { ImageResponse } from "next/og";

export const alt = "NusaRasa - Local Food Marketplace";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 55%, #082f49 100%)",
          color: "white",
          padding: "70px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            width: "520px",
            height: "520px",
            borderRadius: "9999px",
            background: "rgba(34, 211, 238, 0.10)",
            filter: "blur(100px)",
            right: "-100px",
            top: "-140px",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "420px",
            height: "420px",
            borderRadius: "9999px",
            background: "rgba(34, 211, 238, 0.07)",
            filter: "blur(100px)",
            left: "-180px",
            bottom: "-180px",
          }}
        />

        {/* Top branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "#ffffff",
              color: "#020617",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: 900,
              letterSpacing: "-1px",
            }}
          >
            NR
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              NusaRasa
            </div>

            <div
              style={{
                fontSize: "15px",
                color: "#94a3b8",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Local Food Marketplace
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              fontSize: "62px",
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-2.5px",
            }}
          >
            NusaRasa
          </div>

          <div
            style={{
              marginTop: "18px",
              fontSize: "31px",
              lineHeight: 1.25,
              fontWeight: 500,
              color: "#22d3ee",
            }}
          >
            Local Food Marketplace
          </div>

          <div
            style={{
              marginTop: "22px",
              fontSize: "21px",
              lineHeight: 1.5,
              color: "#cbd5e1",
              maxWidth: "800px",
            }}
          >
            Platform marketplace makanan lokal yang membantu UMKM
            menjangkau pelanggan secara digital.
          </div>
        </div>

        {/* Bottom technology line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              fontSize: "15px",
              color: "#94a3b8",
            }}
          >
            <span>Next.js</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Supabase</span>
            <span>•</span>
            <span>PostgreSQL</span>
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "#64748b",
            }}
          >
            nusarasa.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
