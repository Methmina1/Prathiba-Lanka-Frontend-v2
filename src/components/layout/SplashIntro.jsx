import { useEffect, useRef, useState } from 'react'

/**
 * Page-load intro: the page sits blurred behind a frosted overlay while the logo appears in the
 * middle of the screen, the name is painted underneath it in broad white strokes, and then the logo
 * flies into its place in the navbar and the blur clears.
 *
 * The flight is a FLIP: the logo is positioned exactly where the navbar logo will be, transformed
 * back to the centre of the viewport and released, so it lands pixel-perfect. The word is drawn by
 * animating stroke-dashoffset over the glyph outlines (measured with getTotalLength, so the timing
 * is right whatever font ends up being used), then the fill fades in behind the stroke.
 *
 * Plays once per page load (never on client-side route changes) and is skipped entirely for
 * reduced-motion users or when the page opens already scrolled - the navbar logo is hidden once
 * you scroll, so there would be nothing to fly into.
 */

let introStarted = false
let timelineStarted = false

const FLY_MS = 1100
const WORD_HOLD_MS = 1750 // the logo and the painted word sit together this long, then it flies
const TAIL_MS = 200
const FONT_WAIT_MS = 700 // never hang the intro waiting for a webfont
const FALLBACK_PATH_LENGTH = 4000

/** Centred size: generous on a desktop, never wider than the phone it is drawn on. */
const CENTRED_MAX_PX = 420
const CENTRED_VIEWPORT_RATIO = 0.58

export default function SplashIntro() {
  const [phase, setPhase] = useState('idle')
  const [geometry, setGeometry] = useState(null)
  const [wordLength, setWordLength] = useState(FALLBACK_PATH_LENGTH)
  const [painting, setPainting] = useState(false)
  const textRef = useRef(null)

  useEffect(() => {
    if (introStarted) return
    introStarted = true

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const mark = document.querySelector('.brand__mark')

    if (reduced || !mark || window.scrollY > 4) {
      setPhase('done')
      return
    }

    const rect = mark.getBoundingClientRect()
    const viewport = Math.min(window.innerWidth, window.innerHeight)
    const centredSize = Math.min(CENTRED_MAX_PX, viewport * CENTRED_VIEWPORT_RATIO)

    setGeometry({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      scale: Math.max(3, centredSize / rect.width),
      dx: window.innerWidth / 2 - (rect.left + rect.width / 2),
      dy: window.innerHeight / 2 - (rect.top + rect.height / 2),
      // the word sits just under the centred logo
      wordTop: window.innerHeight / 2 + centredSize / 2 + 8,
    })

    document.documentElement.classList.add('intro-playing')
    setPhase('centered')

    // No cleanup on purpose: React's StrictMode runs effects twice in development and these
    // timers must survive that, since the overlay only goes away once the flight has finished.
  }, [])

  // Kick off the painting and the flight once the logo geometry exists and the font is ready.
  useEffect(() => {
    if (!geometry) return undefined

    const start = () => {
      if (timelineStarted) return
      timelineStarted = true

      const length = textRef.current?.getTotalLength?.()
      if (length) setWordLength(length)
      setPainting(true)

      window.setTimeout(() => setPhase('flying'), WORD_HOLD_MS)
      window.setTimeout(() => {
        document.documentElement.classList.remove('intro-playing')
        setPhase('done')
      }, WORD_HOLD_MS + FLY_MS + TAIL_MS)
    }

    const fallback = window.setTimeout(start, FONT_WAIT_MS)
    document.fonts?.ready.then(() => {
      window.clearTimeout(fallback)
      start()
    }) ?? start()

    return () => window.clearTimeout(fallback)
  }, [geometry])

  if (phase === 'done' || !geometry) return null

  const flying = phase === 'flying'

  return (
    <div className={`splash ${flying ? 'is-flying' : ''}`} aria-hidden="true">
      <div className="splash__backdrop" />

      <img
        className="splash__logo"
        src="/logo-mark.png"
        alt=""
        style={{
          top: `${geometry.top}px`,
          left: `${geometry.left}px`,
          width: `${geometry.width}px`,
          height: `${geometry.height}px`,
          transform: flying
            ? 'none'
            : `translate(${geometry.dx}px, ${geometry.dy}px) scale(${geometry.scale})`,
          transition: flying ? `transform ${FLY_MS}ms cubic-bezier(0.16, 0.84, 0.44, 1)` : 'none',
        }}
      />

      <svg
        className="splash__word"
        viewBox="0 0 620 150"
        style={{ top: `${geometry.wordTop}px` }}
        focusable="false"
      >
        <text
          ref={textRef}
          x="310"
          y="100"
          textAnchor="middle"
          className={`splash__word-text ${painting ? 'is-painting' : ''}`}
          style={{ '--word-length': wordLength }}
        >
          PrathibaLanka
        </text>
      </svg>
    </div>
  )
}
