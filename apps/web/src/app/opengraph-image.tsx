import { ImageResponse } from "next/og";

export const alt = "NormInvoice — EU E-Invoice Bridge & Dual Validator (ZUGFeRD, Factur-X & XRechnung)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #172554 55%, #1e3a8a 100%)",
          padding: "64px 72px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              NI
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>NormInvoice</div>
          </div>
          <div
            style={{
              background: "rgba(16, 185, 129, 0.16)",
              border: "1px solid rgba(52, 211, 153, 0.5)",
              color: "#6ee7b7",
              padding: "10px 20px",
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            100% EU Hosted (Germany) · Zero-Retention
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            EU E-Invoice Bridge &amp; Dual Validator
          </div>
          <div style={{ fontSize: 26, color: "#cbd5e1", lineHeight: 1.4, maxWidth: 960 }}>
            Validate ZUGFeRD 2.3, Factur-X 1.07 &amp; XRechnung 3.0.2 free — or automate Stripe &amp; WooCommerce
            billing with GoBD WORM archiving, VIES VAT checks, and DATEV/FEC exports.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["EN 16931", "ZUGFeRD 2.3", "Factur-X 1.07", "XRechnung 3.0.2", "Peppol BIS 3.0", "DATEV & FEC"].map(
            (badge) => (
              <div
                key={badge}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                {badge}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
