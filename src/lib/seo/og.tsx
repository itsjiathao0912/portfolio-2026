import { ImageResponse } from "next/og";
import { EMOJI_DATA_URI, PORTRAIT_DATA_URI, PORTRAIT_PANEL, PORTRAIT_SIZE } from "./og-assets";
import { ARCHIVO_700_B64, INTER_400_B64, INTER_600_B64 } from "./og-fonts";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

// Brand tokens (mirrors src/app/globals.css). Satori cannot read CSS variables.
const INK = "#000000";
const INK_2 = "#1a1b1f";
const INK_3 = "#6b6c72";
const HAIRLINE = "#e6e6e8";
const ACCENT = "#2563eb";

function bytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

let fonts: { name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: "normal" }[] | null = null;
function loadFonts() {
  fonts ??= [
    { name: "Archivo", data: bytes(ARCHIVO_700_B64), weight: 700, style: "normal" },
    { name: "Inter", data: bytes(INTER_400_B64), weight: 400, style: "normal" },
    { name: "Inter", data: bytes(INTER_600_B64), weight: 600, style: "normal" },
  ];
  return fonts;
}

/** Twemoji data URI for a project emoji (tolerates a missing variation selector). */
export function emojiSrc(emoji: string | undefined) {
  if (!emoji) return null;
  return EMOJI_DATA_URI[emoji] ?? EMOJI_DATA_URI[emoji.replace(/️/g, "")] ?? EMOJI_DATA_URI[`${emoji}️`] ?? null;
}

/** Long-lived but revalidating: social crawlers cache hard, and the art only changes on deploy. */
const HEADERS = { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" };

function respond(element: React.ReactElement) {
  return new ImageResponse(element, { ...OG_SIZE, fonts: loadFonts(), headers: HEADERS });
}

function Footer({ right }: { right: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: ACCENT }} />
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, color: INK }}>itsjiathao.com</div>
      </div>
      <div style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 24, color: INK_3 }}>{right}</div>
    </div>
  );
}

/** Home card: name, role, B&W portrait on a soft panel. */
export function homeOg(input: { name: string; title: string; line: string; location: string }) {
  const pw = 400;
  const ph = Math.round((PORTRAIT_SIZE.height * pw) / PORTRAIT_SIZE.width);
  return respond(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff", padding: 56, fontFamily: "Inter" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 40 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 26, color: ACCENT, letterSpacing: 1 }}>
            PORTFOLIO
          </div>
          <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 700, fontSize: 112, lineHeight: 1.0, color: INK, marginTop: 20 }}>
            {input.name}
          </div>
          <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 40, color: INK, marginTop: 24 }}>{input.title}</div>
          <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 400, fontSize: 28, lineHeight: 1.35, color: INK_2, marginTop: 20 }}>
            {input.line}
          </div>
        </div>
        <Footer right={input.location} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          width: 440,
          height: "100%",
          background: PORTRAIT_PANEL,
          borderRadius: 28,
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
        <img src={PORTRAIT_DATA_URI} width={pw} height={ph} alt="" style={{ display: "flex" }} />
      </div>
    </div>,
  );
}

/** Index/section card (About, Work): kicker, big title, one sentence. */
export function sectionOg(input: { kicker: string; title: string; line: string; emoji?: string }) {
  const icon = emojiSrc(input.emoji ?? "👩‍💻");
  return respond(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "#ffffff", padding: 64 }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>
            <img src={icon} width={64} height={64} alt="" />
          ) : null}
          <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 28, color: ACCENT, letterSpacing: 1 }}>
            {input.kicker.toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 700, fontSize: 110, lineHeight: 1.02, color: INK, marginTop: 44 }}>
          {input.title}
        </div>
        <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 400, fontSize: 34, lineHeight: 1.35, color: INK_2, marginTop: 28, maxWidth: 980 }}>
          {input.line}
        </div>
      </div>
      <div style={{ display: "flex", borderTop: `2px solid ${HAIRLINE}`, paddingTop: 28 }}>
        <Footer right="Thao Dao · Technical Product Manager" />
      </div>
    </div>,
  );
}

function shrink(headline: string) {
  const n = headline.length;
  return n > 70 ? 54 : n > 48 ? 62 : 72;
}

/** Case-study card: emoji, title, outcome headline, in the project's accent colour. */
export function caseOg(input: { title: string; headline: string; subtitle: string; emoji?: string; color: string }) {
  const icon = emojiSrc(input.emoji);
  return respond(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#ffffff" }}>
      <div style={{ display: "flex", width: "100%", height: 22, background: input.color }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "52px 64px 48px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 92,
                height: 92,
                borderRadius: 24,
                background: `${input.color}1f`,
                border: `2px solid ${input.color}55`,
              }}
            >
              {icon ? (
                // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>
                <img src={icon} width={60} height={60} alt="" />
              ) : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 6 }}>
              <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 24, color: INK_3, letterSpacing: 1 }}>
                CASE STUDY
              </div>
              <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 700, fontSize: 52, color: INK, marginTop: 4 }}>{input.title}</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Archivo",
              fontWeight: 700,
              fontSize: shrink(input.headline),
              lineHeight: 1.08,
              color: INK,
              marginTop: 44,
              maxWidth: 1040,
            }}
          >
            {input.headline}
          </div>
          <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 400, fontSize: 30, color: INK_2, marginTop: 24 }}>{input.subtitle}</div>
        </div>
        <Footer right="Case study · Thao Dao" />
      </div>
    </div>,
  );
}
