/**
 * Reel3 — "The Realization" (Dominic Fike – Babydoll)
 *
 * Concept: viewer "discovers" fire hacks is free + has $30k in prizes.
 * Each beat drops another fact until they're fully sold.
 *
 * Beat analysis: 83.4 BPM @ 30 fps
 *   BEAT = 22 frames,  BAR = 88 frames
 *   startFrom = 270 (9 s) — hook "I can't move on, baby dog" drops
 *   First beat in reel ≈ frame 16  (B0)
 *
 *  timeline:
 *   0–15       void — tiny "pov:" floats in
 *   B(0) =16   "a free hackathon dropped"
 *   B(0,1)=38  "in the bay area"
 *   B(0,2)=60  "for high schoolers"
 *   B(1) =104  "$30K IN PRIZES" HUGE
 *   B(1,1)=126 "...wait what"
 *   B(2) =192  "free food. free swag. free workshops."
 *   B(3) =280  "june 6, 2026 · bay area"
 *   B(4) =368  FIRE HACKS slam
 *   B(4,1)=390 "your parents can't say no" button
 *   B(4,2)=412 URL
 *   455–480    fade
 */

import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Easing,
  Audio,
  staticFile,
} from "remotion";

// ─── palette ──────────────────────────────────────────────────────────────────
const RED    = "#ef4444";
const WHITE  = "#f4f4f5";
const MUTED  = "rgba(244,244,245,0.45)";
const BG     = "#080808";

// ─── beat constants ───────────────────────────────────────────────────────────
const BEAT = 22;
const BAR  = 88;
const B0   = 16;
const B    = (bars, beats) => B0 + bars * BAR + (beats || 0) * BEAT;

// ─── helpers ──────────────────────────────────────────────────────────────────
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const back = Easing.bezier(0.34, 1.56, 0.64, 1);

function fi(frame, inR, outR, easing) {
  return interpolate(frame, inR, outR, {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
    easing: easing || expo,
  });
}

function sp(frame, start, stiff, damp) {
  return spring({
    frame: frame - start,
    fps: 30,
    config: { stiffness: stiff || 220, damping: damp || 14 },
  });
}

// ─── red flash on beat ────────────────────────────────────────────────────────
function Flash({ frame, at, col }) {
  const op = interpolate(frame, [at, at + 2, at + 10], [0.7, 0.3, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  if (frame < at || frame > at + 10) return null;
  return <AbsoluteFill style={{ background: col || RED, opacity: op, pointerEvents: "none" }} />;
}

// ─── glowing bg pulse ─────────────────────────────────────────────────────────
function GlowBg({ frame }) {
  const r = 350 + Math.sin(frame * 0.055) * 70;
  const i = fi(frame, [0, 50], [0, 0.18]);
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle ${r}px at 50% 50%, rgba(239,68,68,${i}) 0%, transparent 68%)`,
    }} />
  );
}

// ─── handle ───────────────────────────────────────────────────────────────────
function Handle() {
  return (
    <div style={{
      position: "absolute", top: 68, left: 0, right: 0,
      display: "flex", justifyContent: "center",
    }}>
      <span style={{
        fontFamily: "'Arial', sans-serif", fontSize: 28, fontWeight: 700,
        color: "rgba(255,255,255,0.2)", letterSpacing: 5, textTransform: "uppercase",
      }}>
        @codestarters_cupertino
      </span>
    </div>
  );
}

// ─── "pov:" intro  ───────────────────────────────────────────────────────────
function PovLabel({ frame }) {
  const op = fi(frame, [2, 14], [0, 1]);
  const exitOp = fi(frame, [B(0) - 4, B(0) + 4], [1, 0]);
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(op, exitOp) }}>
      <span style={{
        fontFamily: "'Arial', sans-serif", fontSize: 64, fontWeight: 700,
        color: MUTED, letterSpacing: 6, textTransform: "lowercase",
      }}>
        pov:
      </span>
    </AbsoluteFill>
  );
}

// ─── stacked fact lines ───────────────────────────────────────────────────────
function FactSlide({ frame, lines, showFrom, exitAt }) {
  const exitOp = exitAt ? fi(frame, [exitAt - 8, exitAt + 4], [1, 0]) : 1;
  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 20, opacity: exitOp, padding: "0 60px",
    }}>
      {lines.map(({ text, size, col, weight, start, italic }, i) => {
        const s = start !== undefined ? start : showFrom + i * BEAT;
        const op = fi(frame, [s, s + 12], [0, 1]);
        const y  = fi(frame, [s, s + 12], [36, 0]);
        if (frame < s) return null;
        return (
          <div key={i} style={{
            fontFamily: italic ? "'Georgia', serif" : "'Arial Black', Impact, sans-serif",
            fontStyle: italic ? "italic" : "normal",
            fontSize: size || 72,
            fontWeight: weight || 900,
            color: col || WHITE,
            textTransform: italic ? "none" : "uppercase",
            letterSpacing: italic ? 2 : -1,
            textAlign: "center",
            lineHeight: 1.1,
            opacity: op,
            transform: `translateY(${y}px)`,
          }}>
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ─── $30K big money reveal ────────────────────────────────────────────────────
function MoneySlide({ frame }) {
  if (frame < B(1) - 4) return null;
  const sc = sp(frame, B(1), 360, 10);
  const op = fi(frame, [B(1), B(1) + 10], [0, 1]);
  const wtfOp = fi(frame, [B(1, 1), B(1, 1) + 12], [0, 1]);
  const wtfY  = fi(frame, [B(1, 1), B(1, 1) + 12], [20, 0]);
  const exitOp = fi(frame, [B(2) - 10, B(2) + 4], [1, 0]);
  const exitY  = fi(frame, [B(2) - 10, B(2) + 4], [0, -80]);

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 16,
      opacity: exitOp, transform: `translateY(${exitY}px)`,
    }}>
      <div style={{
        fontFamily: "'Arial Black', Impact, sans-serif",
        fontSize: 52, fontWeight: 900, color: MUTED,
        textTransform: "uppercase", letterSpacing: 6,
        opacity: op, transform: `scale(${sc})`,
      }}>
        in prizes
      </div>
      <div style={{
        fontFamily: "'Arial Black', Impact, sans-serif",
        fontSize: 220, fontWeight: 900, lineHeight: 0.9, letterSpacing: -6,
        color: RED,
        filter: "drop-shadow(0 0 60px rgba(239,68,68,0.7))",
        transform: `scale(${sc})`, opacity: op,
      }}>
        $30K
      </div>
      {frame >= B(1, 1) && (
        <div style={{
          fontFamily: "'Georgia', serif", fontStyle: "italic",
          fontSize: 54, color: MUTED, letterSpacing: 2,
          opacity: wtfOp, transform: `translateY(${wtfY}px)`,
        }}>
          ...wait what
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─── perks list slide ─────────────────────────────────────────────────────────
function PerksSlide({ frame }) {
  if (frame < B(2) - 4) return null;
  const perks = ["free food.", "free swag.", "free workshops."];
  const exitOp = fi(frame, [B(3) - 10, B(3) + 4], [1, 0]);

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 32, opacity: exitOp, padding: "0 80px",
    }}>
      {perks.map((p, i) => {
        const s = B(2) + i * BEAT;
        if (frame < s) return null;
        const sc = sp(frame, s, 400, 10);
        const op = fi(frame, [s, s + 10], [0, 1]);
        return (
          <div key={i} style={{
            fontFamily: "'Arial Black', sans-serif",
            fontSize: 86, fontWeight: 900, color: i === 0 ? WHITE : i === 1 ? RED : "rgba(249,115,22,1)",
            textTransform: "lowercase", letterSpacing: -1, lineHeight: 1,
            transform: `scale(${sc})`, opacity: op,
            filter: `drop-shadow(0 0 24px ${i === 1 ? "rgba(239,68,68,0.4)" : "none"})`,
          }}>
            {p}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ─── date + title slam ────────────────────────────────────────────────────────
function DateSlide({ frame }) {
  if (frame < B(3) - 4) return null;
  const op  = fi(frame, [B(3), B(3) + 12], [0, 1]);
  const y   = fi(frame, [B(3), B(3) + 12], [30, 0]);
  const exitOp = fi(frame, [B(4) - 8, B(4) + 4], [1, 0]);

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 12,
      opacity: Math.min(op, exitOp), transform: `translateY(${y}px)`,
    }}>
      <div style={{
        fontFamily: "'Arial Black', sans-serif",
        fontSize: 66, fontWeight: 900, color: MUTED,
        textTransform: "uppercase", letterSpacing: 8,
      }}>June 6, 2026</div>
      <div style={{ width: 200, height: 2, background: RED, borderRadius: 2 }} />
      <div style={{
        fontFamily: "'Arial Black', sans-serif",
        fontSize: 44, fontWeight: 900, color: MUTED,
        textTransform: "uppercase", letterSpacing: 5,
      }}>Bay Area, CA</div>
    </AbsoluteFill>
  );
}

// ─── final FIRE HACKS slam + CTA ─────────────────────────────────────────────
function FinalSlide({ frame }) {
  if (frame < B(4) - 4) return null;

  const titleSc = sp(frame, B(4), 350, 11);
  const titleOp = fi(frame, [B(4), B(4) + 10], [0, 1]);

  const btnSc  = sp(frame, B(4, 1), 300, 13);
  const btnOp  = fi(frame, [B(4, 1), B(4, 1) + 12], [0, 1]);

  const urlOp  = fi(frame, [B(4, 2), B(4, 2) + 12], [0, 1]);
  const urlY   = fi(frame, [B(4, 2), B(4, 2) + 12], [16, 0]);

  const glow = 55 + Math.sin((frame - B(4)) * 0.18) * 20;

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 28,
    }}>
      {/* FIRE HACKS */}
      <div style={{
        fontFamily: "'Arial Black', Impact, sans-serif",
        fontSize: 230, fontWeight: 900, lineHeight: 0.88, letterSpacing: -8,
        textTransform: "uppercase", textAlign: "center",
        background: "linear-gradient(170deg, #fff 0%, #ffbb66 35%, #ef4444 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        transform: `scale(${titleSc})`, opacity: titleOp,
        filter: "drop-shadow(0 0 48px rgba(239,68,68,0.6))",
      }}>
        FIRE{"\n"}HACKS
      </div>

      {/* funny CTA button */}
      <div style={{
        background: RED, borderRadius: 999, padding: "26px 64px",
        transform: `scale(${btnSc})`, opacity: btnOp,
        boxShadow: `0 0 ${glow}px rgba(239,68,68,0.65)`,
      }}>
        <span style={{
          fontFamily: "'Arial Black', sans-serif", fontSize: 42, fontWeight: 900,
          color: "#0a0a0a", textTransform: "lowercase", letterSpacing: -0.5,
        }}>
          your parents can&apos;t say no
        </span>
      </div>

      {/* URL */}
      <div style={{
        fontFamily: "'Courier New', monospace", fontSize: 34, color: "rgba(249,115,22,0.9)",
        letterSpacing: 2,
        opacity: urlOp, transform: `translateY(${urlY}px)`,
      }}>
        codestarters.xyz/firehacks
      </div>
    </AbsoluteFill>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export const RealizationReel = () => {
  const frame = useCurrentFrame();
  const masterOp = interpolate(frame, [458, 480], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden", opacity: masterOp }}>
      <Audio src={staticFile("babydoll.mp3")} startFrom={270} volume={0.85} />
      <GlowBg frame={frame} />

      <Flash frame={frame} at={B(0)} />
      <Flash frame={frame} at={B(1)} col="white" />
      <Flash frame={frame} at={B(2)} />
      <Flash frame={frame} at={B(4)} />

      {frame < B(0) && <PovLabel frame={frame} />}

      {/* Slide 1: facts about fire hacks drop on each beat */}
      {frame >= B(0) && frame < B(1) + BEAT && (
        <FactSlide frame={frame} showFrom={B(0)} exitAt={B(1) + BEAT} lines={[
          { text: "a free hackathon dropped",  size: 76, col: WHITE  },
          { text: "in the bay area",           size: 66, col: MUTED  },
          { text: "for high schoolers",        size: 54, col: "rgba(249,115,22,0.8)", italic: true },
        ]} />
      )}

      <MoneySlide frame={frame} />
      <PerksSlide frame={frame} />
      <DateSlide  frame={frame} />
      <FinalSlide frame={frame} />

      <Handle />
    </AbsoluteFill>
  );
};
