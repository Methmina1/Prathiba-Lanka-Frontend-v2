import { useEffect, useState } from 'react'

/**
 * Page-load intro.
 *
 * The navbar's own brand lockup (logo + name + tagline) is drawn over the page on its way in: the
 * page sits blurred behind a frosted overlay while the lockup appears enlarged from the left, the
 * name is painted on in white and the tagline settles in beneath it, and then the whole thing
 * scales back into its exact place in the navbar.
 *
 * The clone reuses the .brand markup, so it is pixel-identical to the navbar's - the hand-off is a
 * single frame (see .intro-landing). It is positioned over the navbar's rect and transformed back
 * out to the enlarged, vertically-centred start, which is a FLIP in both axes.
 *
 * Plays once per page load (never on client-side route changes) and is skipped for reduced-motion
 * users or when the page opens already scrolled - the brand is hidden once you scroll, so there
 * would be nothing to fly into.
 */

let introStarted = false
let timelineStarted = false

const FLY_MS = 1450
const HOLD_MS = 2200 // painting finishes about here, then the lockup flies home
const TAIL_MS = 200
const FONT_WAIT_MS = 800 // never hang the intro waiting for a webfont
const MAX_SCALE = 2.4
const WIDTH_RATIO = 0.86 // the enlarged lockup never takes more than this much of the width

export default function SplashIntro() {
  const [phase, setPhase] = useState('idle')
  const [geometry, setGeometry] = useState(null)
  const [painting, setPainting] = useState(false)

  useEffect(() => {
    if (introStarted) return
    introStarted = true

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const brand = document.querySelector('.site-header .brand')

    if (reduced || !brand || window.scrollY > 4) {
      setPhase('done')
      return
    }

    const rect = brand.getBoundingClientRect()

    setGeometry({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      // The lockup is drawn at the navbar's rect and transformed back out to the middle of the
      // screen, scaled up, never taking more than a sensible share of the viewport width.
      scale: Math.min(MAX_SCALE, (window.innerWidth * WIDTH_RATIO) / rect.width),
      dx: window.innerWidth / 2 - (rect.left + rect.width / 2),
      dy: window.innerHeight / 2 - (rect.top + rect.height / 2),
    })

    document.documentElement.classList.add('intro-playing')
    setPhase('centered')

    // No cleanup on purpose: React's StrictMode runs effects twice in development and these
    // timers must survive that, since the overlay only goes away once the flight has finished.
  }, [])

  // Start painting once the lockup is on screen and the webfont has settled.
  useEffect(() => {
    if (!geometry) return undefined

    const start = () => {
      if (timelineStarted) return
      timelineStarted = true
      setPainting(true)

      window.setTimeout(() => setPhase('flying'), HOLD_MS)
      window.setTimeout(() => {
        const root = document.documentElement
        root.classList.add('intro-landing')
        root.classList.remove('intro-playing')
        setPhase('done')
        window.requestAnimationFrame(() => root.classList.remove('intro-landing'))
      }, HOLD_MS + FLY_MS + TAIL_MS)
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
    <div className={`splash ${flying ? 'is-flying' : ''}`} aria-hidden="true" style={{ '--fly-ms': `${FLY_MS}ms` }}>
      <div className="splash__backdrop" />

      <div
        className={`brand splash__brand ${painting ? 'is-painting' : ''}`}
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
      >
        <img src="/logo-mark.png" alt="" className="brand__mark" />
        <span className="brand__text">
          <strong>PrathibaLanka</strong>
          <small>Journeys through the emerald isle</small>
        </span>
      </div>
    </div>
  )
}
