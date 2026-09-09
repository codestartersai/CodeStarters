import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Audio,
  staticFile,
} from "remotion";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Espresso ~117 BPM → 15.38 frames/beat → 61.54 frames/bar
// At startFrom=47s: first beat in reel ≈ frame 5
// Bar boundaries: 5, 67, 129, 191, 253, 315, 377
const BEAT_OFFSET = 5;
const BAR = 62; // frames per bar (4 beats)

function fadeIn(frame, start, end) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideRight(frame, start, end) {
  return interpolate(frame, [start, end], [-120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
}

function scaleIn(frame, start, fps) {
  return spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 100 }, durationInFrames: 22 });
}

function FlashAt({ frame, at }) {
  const opacity = interpolate(frame, [at, at + 3, at + 10], [1, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < at || frame > at + 10) return null;
  return (
    <AbsoluteFill style={{ background: "white", opacity, pointerEvents: "none" }} />
  );
}

// Cards: header gets bar 1 (frame 5), cards get bars 2-6, CTA gets bar 7
const REASONS = [
  { emoji: "🆓", title: "It's completely free",    desc: "zero cost. just show up.",              color: "#00cc88", from: BEAT_OFFSET + BAR * 1 }, // 67
  { emoji: "🧑‍💻", title: "Any skill level",         desc: "n00b or nerd, all welcome.",            color: "#3b82f6", from: BEAT_OFFSET + BAR * 2 }, // 129
  { emoji: "🍕", title: "Free food & swag",        desc: "eat good while you code good.",         color: "#ff8c00", from: BEAT_OFFSET + BAR * 3 }, // 191
  { emoji: "🏆", title: "Win prizes",              desc: "build something, take something home.", color: "#ffcc00", from: BEAT_OFFSET + BAR * 4 }, // 253
  { emoji: "🚀", title: "Portfolio boost",         desc: "real project. real clout. real fast.",  color: "#cc44ff", from: BEAT_OFFSET + BAR * 5 }, // 315
];

const CTA_START = BEAT_OFFSET + BAR * 6; // 377

function ReasonCard({ reason, frame, fps }) {
  const { from, emoji, title, desc, color } = reason;
  const isVisible = frame >= from && frame < from + BAR;
  if (!isVisible) return null;

  const localFrame = frame - from;
  const opacity = interpolate(localFrame, [0, 10, BAR - 10, BAR], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = slideRight(localFrame, 0, 14);
  const scale = scaleIn(localFrame, 0, fps);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#141414",
          borderRadius: 36,
          padding: "60px 70px",
          borderLeft: `8px solid ${color}`,
          boxShadow: `0 0 60px ${color}33`,
          opacity,
          transform: `translateX(${x}px) scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        <div style={{ fontSize: 110 }}>{emoji}</div>
        <div
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontSize: 84,
            fontWeight: 900,
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: 50,
            color: color,
            fontWeight: 700,
          }}
        >
          {desc}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ProgressDots({ frame, total = 5, startAt = BEAT_OFFSET + BAR, perCard = BAR }) {
  if (frame < startAt) return null;
  const currentCard = Math.floor((frame - startAt) / perCard);
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 130,
        gap: 16,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === currentCard ? 40 : 14,
            height: 14,
            borderRadius: 7,
            background: i === currentCard ? "#ff4500" : "rgba(255,255,255,0.25)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
}

export const WhyJoin = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = 500 + interpolate(Math.sin(frame * 0.05), [-1, 1], [-40, 40]);

  // Header animates in on bar 1 (frame 5)
  const headerOpacity = fadeIn(frame, BEAT_OFFSET, BEAT_OFFSET + 30);
  const headerY = interpolate(frame, [BEAT_OFFSET, BEAT_OFFSET + 30], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  // Fade out last 20 frames
  const masterOpacity = interpolate(frame, [430, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = fadeIn(frame, CTA_START, CTA_START + 20);

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        overflow: "hidden",
        opacity: masterOpacity,
      }}
    >
      {/* ── Espresso viral chorus starts at ~0:47 ── */}
      <Audio src={staticFile("espresso.mp3")} startFrom={47 * 30} volume={0.8} />

      {/* ambient glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${glowPulse}px at 50% 50%, rgba(255,50,0,0.18) 0%, transparent 70%)`,
        }}
      />

      {/* Flash on every card transition (bar boundaries) */}
      {REASONS.map((r) => (
        <FlashAt key={r.from} frame={frame} at={r.from} />
      ))}

      {/* Header: "5 reasons to join" — bar 1 */}
      {frame < BEAT_OFFSET + BAR && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: 100,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: "'Arial', sans-serif",
              fontSize: 38,
              fontWeight: 900,
              color: "#ff6600",
              letterSpacing: 10,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            🔥 Fire Hacks
          </div>
          <div
            style={{
              fontFamily: "'Arial Black', sans-serif",
              fontSize: 70,
              fontWeight: 900,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: -1,
              lineHeight: 1.05,
              textAlign: "center",
            }}
          >
            5 reasons<br />
            <span style={{ color: "#ff4500" }}>you need to be there</span>
          </div>
        </AbsoluteFill>
      )}

      {/* Reason cards — bars 2-6 */}
      {REASONS.map((r) => (
        <ReasonCard key={r.from} reason={r} frame={frame} fps={fps} />
      ))}

      {/* Progress dots */}
      <ProgressDots frame={frame} />

      {/* Top handle always visible */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 4,
          }}
        >
          @codestarters_cupertino
        </div>
      </div>

      {/* Final CTA — bar 7 */}
      {frame >= CTA_START && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
            opacity: ctaOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "'Arial Black', sans-serif",
              fontSize: 100,
              fontWeight: 900,
              color: "#fff",
              textTransform: "uppercase",
              textAlign: "center",
              lineHeight: 1,
            }}
          >
            Ready?
          </div>
          <div
            style={{
              background: "linear-gradient(135deg,#ff4500,#ff8c00)",
              borderRadius: 80,
              padding: "32px 100px",
              boxShadow: "0 0 80px rgba(255,100,0,0.6)",
            }}
          >
            <div
              style={{
                fontFamily: "'Arial Black', sans-serif",
                fontSize: 50,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              codestarters.xyz/firehacks
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
