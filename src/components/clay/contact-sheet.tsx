// Contact sheet: every role in every pose, bust row, and a skin / hair variety
// row, on the site's light canvas. Used by /lab/clay and rendered statically for
// the originality / polish review. Not shipped in any user-facing route.

import { ClayAvatar } from "./clay-avatar";
import { ROLE_IDS, ROLE_LABELS } from "../site/visitor/role-ids";
import { HAIR_STYLES } from "./parts";
import { ACCENTS, HAIRS, SKINS } from "./palette";
import { POSE_NAMES } from "./poses";

const label = { fontSize: 11, letterSpacing: "0.02em", color: "var(--ink-3)", marginTop: 14, textAlign: "center" as const };

export function ContactSheet({ size = 92 }: { size?: number }) {
  return (
    <div style={{ background: "var(--bg)", color: "var(--ink-1)", padding: 28, fontFamily: "system-ui, sans-serif", width: "max-content" }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Roles x poses</h2>
      <div style={{ display: "grid", gridTemplateColumns: `110px repeat(${POSE_NAMES.length}, ${size + 24}px)`, rowGap: 14, alignItems: "end" }}>
        <span />
        {POSE_NAMES.map((p) => (
          <span key={p} style={{ ...label, marginTop: 0 }}>{p}</span>
        ))}
        {ROLE_IDS.map((r) => (
          <Row key={r} role={r} size={size} />
        ))}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "26px 0 12px" }}>Scale check: headshot 40 / 96 / 240, full body 240</h2>
      <div style={{ display: "flex", gap: 22, alignItems: "flex-end" }} data-testid="clay-scale">
        <ClayAvatar role="designer" view="bust" size={40} />
        <ClayAvatar role="designer" view="bust" size={96} />
        <ClayAvatar role="designer" view="bust" size={240} tint="var(--tint-lavender, #ece8fb)" />
        <ClayAvatar role="founder" pose="wave" size={240} />
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "26px 0 12px" }}>Bust view, 56 / 40 / 28 px, with tint</h2>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-end", flexWrap: "wrap" }}>
        {ROLE_IDS.map((r, i) => (
          <div key={r}>
            <ClayAvatar role={r} view="bust" size={56} tint={`var(--tint-${["sky", "periwinkle", "lavender", "rose", "peach", "mint", "aqua", "butter"][i % 8]}, var(--tint-sky))`} />
            <div style={label}>{ROLE_LABELS[r]}</div>
          </div>
        ))}
        <ClayAvatar role={null} size={56} />
        <ClayAvatar role="founder" view="bust" size={40} />
        <ClayAvatar role="data" view="bust" size={28} />
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "26px 0 12px" }}>Variety: skin tones, hair styles, hair colours</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 1000 }}>
        {SKINS.flatMap((_, s) =>
          HAIR_STYLES.map((_h, h) => <ClayAvatar key={`${s}-${h}`} role="curious" view="bust" size={60} skin={s} hairStyle={h} hair={(s + h) % HAIRS.length} accent={(s * 2 + h) % ACCENTS.length} />),
        )}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "26px 0 12px" }}>Walk cycle frames (founder)</h2>
      <div style={{ display: "flex", gap: 10 }}>
        {[0, 1, 2, 3].map((f) => (
          <ClayAvatar key={f} role="founder" pose="walk" frame={f} size={size} />
        ))}
      </div>
    </div>
  );
}

function Row({ role, size }: { role: (typeof ROLE_IDS)[number]; size: number }) {
  return (
    <>
      <span style={{ fontSize: 12, fontWeight: 500 }}>{ROLE_LABELS[role]}</span>
      {POSE_NAMES.map((p) => (
        <div key={p} style={{ display: "flex", justifyContent: "center" }}>
          <ClayAvatar role={role} pose={p} size={size} />
        </div>
      ))}
    </>
  );
}
