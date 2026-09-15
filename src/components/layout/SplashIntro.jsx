import { useEffect, useState } from 'react'

/**
 * Page-load intro: the page sits blurred behind a frosted overlay while the logo appears in the
 * middle of the screen, then flies into its place in the navbar and the blur clears.
 *
 * The flight is a FLIP: the logo is positioned exactly where the navbar logo will be, then
 * transformed back to the centre of the viewport and released, so it lands pixel-perfect.
 *
 * Plays once per page load (never on client-side route changes) and is skipped entirely for
 * reduced-motion users or when the page opens already scrolled - the navbar logo is hidden once
 * you scroll, so there would be nothing to fly into.
 */

let introStarted = false

const CENTER_SCALE = 4.6
const FLY_MS = 1150
const HOLD_MS = 420
const TAIL_MS = 250

export default function SplashIntro() {
  const [phase, setPhase] = useState('idle')
  const [geometry, setGeometry] = useState(null)

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
    setGeometry({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      dx: window.innerWidth / 2 - (rect.left + rect.width / 2),
      dy: window.innerHeight / 2 - (rect.top + rect.height / 2),
    })

    document.documentElement.classList.add('intro-playing')
    setPhase('centered')

    // No cleanup on purpose: React's StrictMode runs effects twice in development and these
    // timers must survive that, since the overlay only goes away once the flight has finished.
    window.setTimeout(() => setPhase('flying'), HOLD_MS)
    window.setTimeout(() => {
      document.documentElement.classList.remove('intro-playing')
      setPhase('done')
    }, HOLD_MS + FLY_MS + TAIL_MS)
  }, [])

  if (phase === 'done' || !geometry) return null

  const flying = phase === 'flying'

  return (
    <div className={`splash ${flying ? 'is-flying' : ''}`} aria-hidden="true">
      <div className="splash__backdrop" />
      <img
        className="splash__logo"
        src="/logo.png"
        alt=""
        style={{
          top: `${geometry.top}px`,
          left: `${geometry.left}px`,
          width: `${geometry.width}px`,
          height: `${geometry.height}px`,
          transform: flying
            ? 'none'
            : `translate(${geometry.dx}px, ${geometry.dy}px) scale(${CENTER_SCALE})`,
          transition: flying ? `transform ${FLY_MS}ms cubic-bezier(0.16, 0.84, 0.44, 1)` : 'none',
        }}
      />
    </div>
  )
}
