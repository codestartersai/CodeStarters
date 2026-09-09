import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
  Audio,
  staticFile,
} from "remotion";

// ── helpers ──────────────────────────────────────────────────────────────────
const ease = Easing.bezier(0.16, 1, 0.3, 1); // expo-out

function scaleIn(frame, start, duration, fps) {
  return spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: duration });
}

function fadeIn(frame, start, end) {
  return interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

function slideUp(frame, start, end) {
  return interpolate(frame, [start, end], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
}

// ── Particle dots ─────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: 5 + ((i * 67) % 90),
  y: 5 + ((i * 43) % 90),
  size: 3 + (i % 5),
  speed: 0.3 + (i % 4) * 0.15,
  delay: i * 7,
  color: i % 3 === 0 ? "#ff8c00" : i % 3 === 1 ? "#ff4500" : "#ffcc00",
}));

function Particles({ frame }) {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {PARTICLES.map((p) => {
        const t = (frame - p.delay) * p.speed;
        const y = ((p.y - (t * 0.08)) % 110) - 5;
        const opacity = interpolate(Math.sin((frame + p.id * 30) * 0.05), [-1, 1], [0.2, 0.8]);
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// ── Flash overlay ─────────────────────────────────────────────────────────────
function FlashAt({ frame, at }) {
  const opacity = interpolate(frame, [at, at + 4, at + 12], [1, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < at || frame > at + 12) return null;
  return (
    <AbsoluteFill
      style={{ background: "white", opacity, pointerEvents: "none" }}
    />
  );
}

// ── BigWord ───────────────────────────────────────────────────────────────────
function BigWord({ text, frame, startFrame, color = "#fff", size = 200 }) {
  const { fps } = useVideoConfig();
  const s = scaleIn(frame, startFrame, 20, fps);
  const opacity = fadeIn(frame, startFrame, startFrame + 8);
  return (
    <div
      style={{
        fontFamily: "'Arial Black', Impact, sans-serif",
        fontSize: size,
        fontWeight: 900,
        color,
        textTransform: "uppercase",
        letterSpacing: -4,
        lineHeight: 1,
        transform: `scale(${s})`,
        opacity,
        textShadow: `0 0 60px ${color}88`,
      }}
    >
      {text}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export const HypeTrailer = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── BG glow pulse ──────────────────────────────────────────────────────────
  const glowSize = 600 + interpolate(Math.sin(frame * 0.04), [-1, 1], [-60, 60]);

  // Section timing
  // 0-60:   black + ember sparks build
  // 60-120: FIRE crashes in
  // 120-180: HACKS crashes in
  // 180-270: subtitle fades in
  // 270-360: quick reasons (3 x 30f)
  // 360-450: CTA
  // 450-540: URL hold + fade out

  const fireScale = scaleIn(frame, 55, 25, fps);
  const hacksScale = scaleIn(frame, 115, 25, fps);

  const subtitleOpacity = fadeIn(frame, 185, 220);
  const subtitleY = slideUp(frame, 185, 220);

  const reason1Opacity = fadeIn(frame, 275, 295);
  const reason1Y = slideUp(frame, 275, 295);
  const reason2Opacity = fadeIn(frame, 305, 325);
  const reason2Y = slideUp(frame, 305, 325);
  const reason3Opacity = fadeIn(frame, 335, 355);
  const reason3Y = slideUp(frame, 335, 355);

  const ctaScale = scaleIn(frame, 365, 25, fps);
  const ctaOpacity = fadeIn(frame, 365, 390);

  const urlOpacity = fadeIn(frame, 460, 490);
  const urlY = slideUp(frame, 460, 490);

  // fade out last 20 frames
  const masterOpacity = interpolate(frame, [520, 540], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#090909",
        overflow: "hidden",
        opacity: masterOpacity,
      }}
    >
      {/* ── Phantom viral hook starts at ~0:20 ── */}
      <Audio src={staticFile("phantom.mp3")} startFrom={12 * 30} volume={0.8} />
      {/* ── ambient glow ── */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${glowSize}px at 50% 45%, rgba(255,60,0,0.28) 0%, transparent 70%)`,
        }}
      />

      {/* ── particles ── */}
      <Particles frame={frame} />

      {/* ── flash hits ── */}
      <FlashAt frame={frame} at={58} />
      <FlashAt frame={frame} at={118} />
      <FlashAt frame={frame} at={365} />

      {/* ── FIRE + HACKS title block ── */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* ── FIRE ── */}
        <Sequence from={55}>
          <AbsoluteFill
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* top label */}
            {frame >= 185 && (
              <div
                style={{
                  fontFamily: "'Arial', sans-serif",
                  fontSize: 42,
                  fontWeight: 900,
                  letterSpacing: 12,
                  color: "#ff6600",
                  textTransform: "uppercase",
                  opacity: subtitleOpacity,
                  transform: `translateY(${subtitleY}px)`,
                  marginBottom: 20,
                }}
              >
                CodeStarters Presents
              </div>
            )}

            {/* FIRE */}
            <div
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                fontSize: 260,
                fontWeight: 900,
                lineHeight: 0.85,
                textTransform: "uppercase",
                letterSpacing: -8,
                background: "linear-gradient(180deg,#ffffff 0%,#ffaa00 40%,#ff3300 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                transform: `scale(${frame >= 55 ? fireScale : 0})`,
                filter: "drop-shadow(0 0 40px rgba(255,100,0,0.7))",
              }}
            >
              FIRE
            </div>

            {/* HACKS */}
            {frame >= 115 && (
              <div
                style={{
                  fontFamily: "'Arial Black', Impact, sans-serif",
                  fontSize: 260,
                  fontWeight: 900,
                  lineHeight: 0.85,
                  textTransform: "uppercase",
                  letterSpacing: -8,
                  background: "linear-gradient(180deg,#ffffff 0%,#ffaa00 40%,#ff3300 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  transform: `scale(${hacksScale})`,
                  filter: "drop-shadow(0 0 40px rgba(255,100,0,0.7))",
                }}
              >
                HACKS
              </div>
            )}

            {/* subtitle */}
            {frame >= 185 && (
              <div
                style={{
                  fontFamily: "'Arial', sans-serif",
                  fontSize: 46,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: 4,
                  marginTop: 24,
                  opacity: subtitleOpacity,
                  transform: `translateY(${subtitleY}px)`,
                }}
              >
                the hackathon that goes hard
              </div>
            )}

            {/* ── Quick reasons 270-360 ── */}
            {frame >= 275 && frame < 460 && (
              <div
                style={{
                  marginTop: 60,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 22,
                }}
              >
                {frame >= 275 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      opacity: reason1Opacity,
                      transform: `translateY(${reason1Y}px)`,
                    }}
                  >
                    <span style={{ fontSize: 52 }}>🔥</span>
                    <span style={{ fontFamily: "'Arial Black', sans-serif", fontSize: 52, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 2 }}>Build something real</span>
                  </div>
                )}
                {frame >= 305 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      opacity: reason2Opacity,
                      transform: `translateY(${reason2Y}px)`,
                    }}
                  >
                    <span style={{ fontSize: 52 }}>🏆</span>
                    <span style={{ fontFamily: "'Arial Black', sans-serif", fontSize: 52, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 2 }}>Win actual prizes</span>
                  </div>
                )}
                {frame >= 335 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      opacity: reason3Opacity,
                      transform: `translateY(${reason3Y}px)`,
                    }}
                  >
                    <span style={{ fontSize: 52 }}>🚀</span>
                    <span style={{ fontFamily: "'Arial Black', sans-serif", fontSize: 52, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 2 }}>Level up fast</span>
                  </div>
                )}
              </div>
            )}

            {/* ── CTA 360-450 ── */}
            {frame >= 365 && frame < 520 && (
              <div
                style={{
                  marginTop: 60,
                  background: "linear-gradient(135deg,#ff4500,#ff8c00)",
                  borderRadius: 80,
                  padding: "28px 80px",
                  transform: `scale(${ctaScale})`,
                  opacity: ctaOpacity,
                  boxShadow: "0 0 80px rgba(255,100,0,0.6)",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ fontFamily: "'Arial Black', sans-serif", fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: 3, textTransform: "uppercase" }}>
                  Registration Coming Soon
                </div>
              </div>
            )}

            {/* ── URL ── */}
            {frame >= 460 && (
              <div
                style={{
                  marginTop: 40,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 44,
                  color: "#ff9944",
                  letterSpacing: 2,
                  opacity: urlOpacity,
                  transform: `translateY(${urlY}px)`,
                }}
              >
                codestarters.xyz/firehacks
              </div>
            )}

          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>

      {/* ── fire emoji intro ── */}
      {frame < 60 && (
        <AbsoluteFill
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            style={{
              fontSize: 180,
              opacity: interpolate(frame, [0, 20, 50, 60], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              filter: `drop-shadow(0 0 ${40 + frame}px rgba(255,100,0,0.9))`,
            }}
          >
            🔥
          </div>
        </AbsoluteFill>
      )}

      {/* ── top handle ── */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: 34,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 4,
          }}
        >
          @codestarters_cupertino
        </div>
      </div>
    </AbsoluteFill>
  );
};
