/**
 * Reel4 — "The Taylor Swift Lore Version" (Taylor Swift – The Fate of Ophelia)
 *
 * Concept: overly dramatic chapter cards (like Taylor Swift album lore)
 * applied to completely mundane hackathon facts. Comedy through bathos.
 *
 * Beat analysis: 123.0 BPM @ 30 fps
 *   BEAT = 15 frames,  BAR = 60 frames
 *   startFrom = 1590 (53 s) — chorus "All that I said alone in my tower…"
 *   First beat in reel ≈ frame 6  (B0)
 *
 *  timeline:
 *   0–5             void
 *   Bar 0  (B0=6)   "Chapter I  ·  The Announcement" → "a hackathon. june 6th."
 *   Bar 1  (66)     "Chapter II ·  The Prize"        → "$30,000" → "(for high schoolers)"
 *   Bar 2  (126)    "Chapter III · The Cost"         → "$0.00"   → "(yes, really)"
 *   Bar 3  (186)    "Chapter IV  · The Food"         → "free."   → "(obviously)"
 *   Bar 4  (246)    "Chapter V   · The Sponsors"     → logo strip
 *   Bar 5  (306)    FIRE HACKS epic reveal
 *   Bar 6  (366)    "register before your summer gets boring"
 *   Bar 7  (426)    URL hold
 *   455–480         fade
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
const RED   = "#ef4444";
const CREAM = "#f5f0e8";
const GOLD  = "#f59e0b";
const BG    = "#060608";
const MUTED = "rgba(245,240,232,0.38)";

// ─── beat constants ───────────────────────────────────────────────────────────
const BEAT = 15;
const BAR  = 60;
const B0   = 6;
const B    = (bars, beats) => B0 + bars * BAR + (beats || 0) * BEAT;

// ─── helpers ──────────────────────────────────────────────────────────────────
const expo = Easing.bezier(0.16, 1, 0.3, 1);

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

// ─── ethereal glow bg ─────────────────────────────────────────────────────────
function GlowBg({ frame }) {
  const r = 380 + Math.sin(frame * 0.04) * 60;
  const i = fi(frame, [0, 60], [0, 0.14]);
  return (
    <AbsoluteFill style={{
      background: `
        radial-gradient(circle ${r}px at 50% 46%, rgba(239,68,68,${i}) 0%, transparent 62%),
        radial-gradient(circle 260px at 25% 75%, rgba(245,158,11,${i * 0.5}) 0%, transparent 55%)
      `,
    }} />
  );
}

// ─── white flash ──────────────────────────────────────────────────────────────
function Flash({ frame, at, col }) {
  const op = interpolate(frame, [at, at + 2, at + 8], [0.65, 0.3, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  if (frame < at || frame > at + 8) return null;
  return <AbsoluteFill style={{ background: col || CREAM, opacity: op, pointerEvents: "none" }} />;
}

// ─── handle ───────────────────────────────────────────────────────────────────
function Handle() {
  return (
    <div style={{
      position: "absolute", top: 68, left: 0, right: 0,
      display: "flex", justifyContent: "center",
    }}>
      <span style={{
        fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 26,
        color: "rgba(245,240,232,0.2)", letterSpacing: 3,
      }}>
        @codestarters_cupertino
      </span>
    </div>
  );
}

// ─── Chapter card ─────────────────────────────────────────────────────────────
// chapter: "Chapter I"  subtitle: "The Announcement"
// body: main big text    aside: small parenthetical
function ChapterCard({ frame, chapter, subtitle, body, bodyCol, aside, showFrom, exitAt }) {
  const chapOp  = fi(frame, [showFrom, showFrom + 10], [0, 1]);
  const chapY   = fi(frame, [showFrom, showFrom + 10], [20, 0]);
  const bodyOp  = fi(frame, [showFrom + BEAT, showFrom + BEAT + 12], [0, 1]);
  const bodyY   = fi(frame, [showFrom + BEAT, showFrom + BEAT + 12], [40, 0]);
  const asideOp = aside ? fi(frame, [showFrom + BEAT * 2, showFrom + BEAT * 2 + 12], [0, 1]) : 0;
  const asideY  = aside ? fi(frame, [showFrom + BEAT * 2, showFrom + BEAT * 2 + 12], [20, 0]) : 0;
  const exitOp  = exitAt ? fi(frame, [exitAt - 8, exitAt + 4], [1, 0]) : 1;

  if (frame < showFrom) return null;

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 24, opacity: exitOp, padding: "0 80px",
    }}>
      {/* horizontal rule */}
      <div style={{
        display: "flex", alignItems: "center", gap: 18, width: "100%", justifyContent: "center",
        opacity: chapOp, transform: `translateY(${chapY}px)`,
      }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}66)` }} />
        <span style={{
          fontFamily: "'Georgia', serif", fontStyle: "italic",
          fontSize: 30, color: GOLD, letterSpacing: 4, whiteSpace: "nowrap",
        }}>
          {chapter}
        </span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GOLD}66, transparent)` }} />
      </div>

      {/* subtitle */}
      <div style={{
        fontFamily: "'Georgia', serif", fontStyle: "italic",
        fontSize: 50, color: MUTED, letterSpacing: 2, textAlign: "center",
        opacity: chapOp, transform: `translateY(${chapY}px)`,
      }}>
        {subtitle}
      </div>

      {/* body — big dramatic text */}
      {frame >= showFrom + BEAT && (
        <div style={{
          fontFamily: "'Arial Black', Impact, sans-serif",
          fontSize: typeof body === "string" && body.length < 6 ? 200 : 90,
          fontWeight: 900, letterSpacing: -2, lineHeight: 1.05,
          color: bodyCol || CREAM, textAlign: "center",
          filter: bodyCol === RED ? "drop-shadow(0 0 40px rgba(239,68,68,0.5))" : "none",
          opacity: bodyOp, transform: `translateY(${bodyY}px)`,
          textTransform: "uppercase",
        }}>
          {body}
        </div>
      )}

      {/* aside — parenthetical in italic */}
      {aside && frame >= showFrom + BEAT * 2 && (
        <div style={{
          fontFamily: "'Georgia', serif", fontStyle: "italic",
          fontSize: 50, color: MUTED, letterSpacing: 1, textAlign: "center",
          opacity: asideOp, transform: `translateY(${asideY}px)`,
        }}>
          {aside}
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─── Sponsors chapter (bar 4) ─────────────────────────────────────────────────
const LOGOS = [
  { src: "codecrafters.svg", maxH: 90  },
  { src: "featherless.png",  maxH: 130 },
  { src: "n8n.png",          maxH: 100 },
];

function SponsorsChapter({ frame }) {
  if (frame < B(4) - 4) return null;
  const chapOp = fi(frame, [B(4), B(4) + 10], [0, 1]);
  const chapY  = fi(frame, [B(4), B(4) + 10], [20, 0]);
  const exitOp = fi(frame, [B(5) - 8, B(5) + 4], [1, 0]);

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 44, opacity: exitOp, padding: "0 60px",
    }}>
      {/* Chapter header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 18, width: "100%", justifyContent: "center",
        opacity: chapOp, transform: `translateY(${chapY}px)`,
      }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}66)` }} />
        <span style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: 30, color: GOLD, letterSpacing: 4 }}>
          Chapter V
        </span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GOLD}66, transparent)` }} />
      </div>
      <div style={{
        fontFamily: "'Georgia', serif", fontStyle: "italic",
        fontSize: 50, color: MUTED, opacity: chapOp, transform: `translateY(${chapY}px)`,
      }}>
        The Believers
      </div>

      {/* 3 large logo tiles in a row */}
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {LOGOS.map(({ src, maxH }, i) => {
          const s  = B(4, 1) + i * BEAT;
          if (frame < s) return null;
          const sc = sp(frame, s, 360, 11);
          const op = fi(frame, [s, s + 8], [0, 1]);
          return (
            <div key={i} style={{
              width: 260,
              height: 180,
              background: RED,
              borderRadius: 22,
              border: "1px solid rgba(0,0,0,0.12)",
              boxShadow:
                "0 14px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 22,
              transform: `scale(${sc})`,
              opacity: op,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={staticFile(src)}
                alt={src}
                style={{
                  maxWidth: "100%",
                  maxHeight: maxH,
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ─── FIRE HACKS reveal (bar 5) ────────────────────────────────────────────────
function TitleReveal({ frame }) {
  if (frame < B(5) - 4) return null;

  const sc = sp(frame, B(5), 300, 11);
  const op = fi(frame, [B(5), B(5) + 12], [0, 1]);
  const exitOp = fi(frame, [B(6) - 8, B(6) + 4], [1, 0]);

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: Math.min(op, exitOp),
    }}>
      <div style={{
        fontFamily: "'Arial Black', Impact, sans-serif",
        fontSize: 270, fontWeight: 900, lineHeight: 0.88, letterSpacing: -9,
        textTransform: "uppercase", textAlign: "center",
        background: "linear-gradient(170deg, #f5f0e8 0%, #f59e0b 38%, #ef4444 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        transform: `scale(${sc})`,
        filter: "drop-shadow(0 0 64px rgba(239,68,68,0.65))",
      }}>
        FIRE{"\n"}HACKS
      </div>
    </AbsoluteFill>
  );
}

// ─── Funny CTA (bar 6) ────────────────────────────────────────────────────────
function FunnyCTA({ frame }) {
  if (frame < B(6) - 4) return null;

  const sc  = sp(frame, B(6), 280, 13);
  const op  = fi(frame, [B(6), B(6) + 12], [0, 1]);
  const urlOp = fi(frame, [B(6, 2), B(6, 2) + 12], [0, 1]);
  const urlY  = fi(frame, [B(6, 2), B(6, 2) + 12], [16, 0]);
  const glow  = 64 + Math.sin((frame - B(6)) * 0.2) * 22;

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32,
    }}>
      <div style={{
        fontFamily: "'Georgia', serif", fontStyle: "italic",
        fontSize: 56, color: CREAM, textAlign: "center", lineHeight: 1.3,
        opacity: op, transform: `scale(${sc})`,
      }}>
        register before your<br />
        <span style={{ color: RED, fontStyle: "normal",
          fontFamily: "'Arial Black', sans-serif", fontSize: 64, letterSpacing: -1 }}>
          summer gets boring
        </span>
      </div>

      <div style={{
        background: RED, borderRadius: 999, padding: "28px 72px",
        boxShadow: `0 0 ${glow}px rgba(239,68,68,0.65)`,
        opacity: op, transform: `scale(${sc})`,
      }}>
        <span style={{
          fontFamily: "'Arial Black', sans-serif", fontSize: 44, fontWeight: 900,
          color: "#0a0a0a", textTransform: "lowercase", letterSpacing: -0.5,
        }}>
          apply free — june 6
        </span>
      </div>

      <div style={{
        fontFamily: "'Courier New', monospace", fontSize: 34, color: GOLD,
        letterSpacing: 2, opacity: urlOp, transform: `translateY(${urlY}px)`,
      }}>
        codestarters.xyz/firehacks
      </div>
    </AbsoluteFill>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export const TaylorSwiftLore = () => {
  const frame = useCurrentFrame();
  const masterOp = interpolate(frame, [458, 480], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden", opacity: masterOp }}>
      <Audio src={staticFile("ophelia.mp3")} startFrom={1590} volume={0.82} />
      <GlowBg frame={frame} />

      <Flash frame={frame} at={B(1)} />
      <Flash frame={frame} at={B(2)} col={RED} />
      <Flash frame={frame} at={B(5)} />

      <ChapterCard frame={frame} chapter="Chapter I"   subtitle="The Announcement"
        body="a hackathon. june 6th."  bodyCol={CREAM}
        aside="(bay area, ca)"
        showFrom={B(0)} exitAt={B(1)} />

      <ChapterCard frame={frame} chapter="Chapter II"  subtitle="The Prize"
        body="$30,000" bodyCol={RED}
        aside="(yes. for high schoolers.)"
        showFrom={B(1)} exitAt={B(2)} />

      <ChapterCard frame={frame} chapter="Chapter III" subtitle="The Cost"
        body="$0.00"  bodyCol={CREAM}
        aside="(yes, really)"
        showFrom={B(2)} exitAt={B(3)} />

      <ChapterCard frame={frame} chapter="Chapter IV"  subtitle="The Food"
        body="free."  bodyCol="rgba(249,115,22,1)"
        aside="(obviously)"
        showFrom={B(3)} exitAt={B(4)} />

      <SponsorsChapter frame={frame} />
      <TitleReveal     frame={frame} />
      <FunnyCTA        frame={frame} />

      <Handle />
    </AbsoluteFill>
  );
};
