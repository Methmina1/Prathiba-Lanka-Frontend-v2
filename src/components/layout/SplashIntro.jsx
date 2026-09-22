import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Page-load intro.
 *
 * The navbar's own brand lockup (logo + name + tagline) is drawn over the page on its way in: the
 * page sits blurred behind a frosted overlay while the lockup appears enlarged in the middle of the
 * screen, the name is painted on in white and the tagline settles in beneath it, and then the whole
 * thing scales back into its exact place in the navbar.
 *
 * The clone reuses the .brand markup, so it is identical to the navbar's - the hand-off is a single
 * frame (see .intro-landing). It is anchored at the navbar's own position and transformed out to
 * the middle of the screen, so it lands pixel-perfect however it is sized.
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
const WIDTH_RATIO_NARROW = 0.92 // phones get a little more, so the mark can still grow
const NARROW_PX = 560
const STACKED_PX = 560 // matches the stacking media query in components.css
const MARK_BUMP = 1.5 // how much larger the logo reads while loading, versus the navbar

/** Centre and scale on the clone's own box, so the visible lockup is what ends up centred. */
function computePlacement(node, anchor) {
  const width = node.offsetWidth
  const height = node.offsetHeight
  const ratio = window.innerWidth < NARROW_PX ? WIDTH_RATIO_NARROW : WIDTH_RATIO

  return {
    scale: Math.min(MAX_SCALE, (window.innerWidth * ratio) / (width + anchor.markExtra)),
    dx: window.innerWidth / 2 - (anchor.left + width / 2),
    dy: window.innerHeight / 2 - (anchor.top + height / 2),
  }
}

export default function SplashIntro() {
  const [phase, setPhase] = useState('idle')
  const [anchor, setAnchor] = useState(null) // where the navbar keeps its brand
  const [placement, setPlacement] = useState(null) // how the clone is centred and scaled
  const [painting, setPainting] = useState(false)
  const [flyer, setFlyer] = useState(null) // phone hand-over: one mark travelling to the navbar
  const brandRef = useRef(null)
  const markRef = useRef(null)

  useEffect(() => {
    if (introStarted) return
    introStarted = true

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const brand = document.querySelector('.site-header .brand')
    const mark = document.querySelector('.site-header .brand__mark')

    if (reduced || !brand || window.scrollY > 4) {
      setPhase('done')
      return
    }

    const rect = brand.getBoundingClientRect()
    // the mark is scaled up on its own, so it sticks out past its box; the text is shifted clear
    // of it by the same amount so the visual gap matches the navbar's
    const markBox = mark?.getBoundingClientRect()
    const markWidth = markBox?.width ?? 0
    const extra = markWidth * (MARK_BUMP - 1)

    setAnchor({
      top: rect.top,
      left: rect.left,
      markExtra: extra / 2,
      stacked: window.innerWidth <= STACKED_PX,
      markRect: markBox
        ? { top: markBox.top, left: markBox.left, width: markBox.width, height: markBox.height }
        : null,
    })
    document.documentElement.classList.add('intro-playing')
    setPhase('centered')

    // No cleanup on purpose: React's StrictMode runs effects twice in development and these
    // timers must survive that, since the overlay only goes away once the flight has finished.
  }, [])

  /*
   * Centre and scale on the clone's OWN measured box, not the navbar's: the clone can be wider than
   * the navbar lockup (the tagline shares a column with the name), and centring the navbar's rect
   * would leave the visible lockup off-centre.
   */
  useLayoutEffect(() => {
    if (!anchor || placement) return
    const node = brandRef.current
    if (!node) return
    setPlacement(computePlacement(node, anchor))
  }, [anchor, placement])

  // Start painting once the lockup is in place and the webfont has settled.
  useEffect(() => {
    if (!placement) return undefined

    const start = () => {
      if (timelineStarted) return
      timelineStarted = true

      // the font may have swapped since the first measurement, which changes the lockup's width
      const node = brandRef.current
      if (node) setPlacement(computePlacement(node, anchor))

      setPainting(true)

      window.setTimeout(() => {
        // Phones stack the lockup, and a column cannot morph into the navbar's row - so the mark is
        // handed over to a free-flying copy that travels from where it is now to its navbar slot,
        // while the stacked lockup fades out.
        if (anchor.stacked && markRef.current && anchor.markRect) {
          const from = markRef.current.getBoundingClientRect()
          setFlyer({
            from: { top: from.top, left: from.left, width: from.width, height: from.height },
            to: anchor.markRect,
            moving: false,
          })
          window.requestAnimationFrame(() =>
            setFlyer((value) => (value ? { ...value, moving: true } : value))
          )
        }
        setPhase('flying')
      }, HOLD_MS)
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
  }, [placement, anchor])

  if (phase === 'done' || !anchor) return null

  const flying = phase === 'flying'
  const ready = Boolean(placement)

  return (
    <div
      className={`splash ${flying ? 'is-flying' : ''} ${anchor.stacked ? 'splash--stacked' : ''}`}
      aria-hidden="true"
      style={{
        '--fly-ms': `${FLY_MS}ms`,
        '--mark-bump': MARK_BUMP,
        '--mark-shift': `${anchor.markExtra}px`,
      }}
    >
      <div className="splash__backdrop" />

      <div
        ref={brandRef}
        className={`brand splash__brand ${painting ? 'is-painting' : ''}`}
        style={{
          top: `${anchor.top}px`,
          left: `${anchor.left}px`,
          visibility: ready ? 'visible' : 'hidden',
          // in stacked mode the lockup stays put and fades, while the flyer below does the travelling
          transform:
            flying && !anchor.stacked
              ? 'none'
              : ready
                ? `translate(${placement.dx}px, ${placement.dy}px) scale(${placement.scale})`
                : 'none',
          transition:
            flying && !anchor.stacked
              ? `transform ${FLY_MS}ms cubic-bezier(0.16, 0.84, 0.44, 1)`
              : 'none',
        }}
      >
        <img ref={markRef} src="/logo-mark.png" alt="" className="brand__mark" />
        <span className="brand__text">
          {/* Identical to the navbar's lockup, tagline-less since the agency dropped it. */}
          <strong>PrathibaLanka Voyages</strong>
        </span>
      </div>

      {flyer && (
        <img
          src="/logo-mark.png"
          alt=""
          className="splash__flyer"
          style={{
            top: `${(flyer.moving ? flyer.to : flyer.from).top}px`,
            left: `${(flyer.moving ? flyer.to : flyer.from).left}px`,
            width: `${(flyer.moving ? flyer.to : flyer.from).width}px`,
            height: `${(flyer.moving ? flyer.to : flyer.from).height}px`,
            transition: flyer.moving
              ? `top ${FLY_MS}ms cubic-bezier(0.16, 0.84, 0.44, 1), left ${FLY_MS}ms cubic-bezier(0.16, 0.84, 0.44, 1), width ${FLY_MS}ms cubic-bezier(0.16, 0.84, 0.44, 1), height ${FLY_MS}ms cubic-bezier(0.16, 0.84, 0.44, 1)`
              : 'none',
          }}
        />
      )}
    </div>
  )
}
