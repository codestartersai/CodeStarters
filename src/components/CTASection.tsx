import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export function CTASection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsUrl = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, () => {
        video.src = hlsUrl;
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    }
  }, []);

  return (
    <section className="relative py-32 md:py-44 px-6 border-t border-border/30 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 bg-background/45 z-[1]" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div {...fadeUp(0)} className="relative w-10 h-10 mx-auto mb-8">
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-foreground/60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-foreground/60" />
        </motion.div>

        <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-6xl font-serif italic mb-6">
          Start Your Journey
        </motion.h2>

        <motion.p {...fadeUp(0.2)} className="text-muted-foreground mb-12">
          Join thousands of readers and creators building meaningful connections through thoughtful
          content.
        </motion.p>

        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-foreground text-background rounded-lg px-8 py-3.5 font-medium hover:bg-foreground/90 transition-colors"
          >
            Subscribe Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="liquid-glass rounded-lg px-8 py-3.5 font-medium hover:bg-white/10 transition-colors"
          >
            Start Writing
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
