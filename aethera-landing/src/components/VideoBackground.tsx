import { useEffect, useRef } from 'react'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4'

const FADE_DURATION = 0.5

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateOpacity = () => {
      if (!video.duration || isNaN(video.duration)) {
        rafRef.current = requestAnimationFrame(updateOpacity)
        return
      }

      const t = video.currentTime
      const d = video.duration
      let opacity = 1

      if (t < FADE_DURATION) {
        opacity = t / FADE_DURATION
      } else if (t > d - FADE_DURATION) {
        opacity = Math.max(0, (d - t) / FADE_DURATION)
      }

      video.style.opacity = String(opacity)
      rafRef.current = requestAnimationFrame(updateOpacity)
    }

    const handleEnded = () => {
      video.style.opacity = '0'
      window.setTimeout(() => {
        video.currentTime = 0
        void video.play()
      }, 100)
    }

    video.addEventListener('ended', handleEnded)
    rafRef.current = requestAnimationFrame(updateOpacity)

    return () => {
      video.removeEventListener('ended', handleEnded)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className="absolute right-0 bottom-0 left-0 overflow-hidden"
      style={{ top: '300px' }}
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        muted
        playsInline
        autoPlay
        className="h-full w-full object-cover"
        style={{ opacity: 0 }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </div>
  )
}
