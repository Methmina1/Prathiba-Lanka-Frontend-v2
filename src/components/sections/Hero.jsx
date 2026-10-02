import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from '../ui/Icons'
import PHOTOS from '../../data/photos'
import { useAuth } from '../../auth/AuthContext'

/** Slide order matches the photographs in src/data/photos.js: coast, wildlife, culture, sunsets. */
const SLIDES = [  {
    eyebrow: 'The coast',
    title: 'Turquoise water, warm the whole year',
    text: 'Shallow reef bays, fishing boats at first light, and sand that stays quiet even in season.',
    cta: { label: 'See the coast journeys', to: '/journeys?destination=galle' },
  },
  {
    eyebrow: 'Wildlife',
    title: 'Leopards, herds and real wilderness',
    text: 'Dawn drives in Yala and Wilpattu, the elephant gathering at Minneriya, forest that was never cleared.',
    cta: { label: 'See the wildlife journeys', to: '/journeys?destination=yala' },
  },
  {
    eyebrow: 'Culture',
    title: 'Two thousand years, still standing',
    text: 'Rock fortresses, cave temples and the sacred city of Kandy, read properly by a guide who lives here.',
    cta: { label: 'See the cultural journeys', to: '/journeys?destination=cultural' },
  },
  {
    eyebrow: 'Golden hour',
    title: 'Evenings that end in gold',
    text: 'The west coast turns amber around six, and there is nowhere better to be than the water\u2019s edge.',
    cta: { label: 'See every journey', to: '/journeys' },
  },
].map((slide, index) => ({ ...slide, image: PHOTOS.hero[index] }))

/**
 * The homepage's H1, and the only heading on it that never changes.
 *
 * The rotating line used to be the h1, which meant the single most important heading on the site
 * said something different every seven seconds and never said what the business actually does. A
 * heading has to be one stable statement: this is the phrase the homepage is trying to rank for, and
 * the rotation below it is now decoration that happens to be heading-shaped.
 */
const HERO_HEADING = 'Private Sri Lanka tours, tailor-made by local specialists'

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (paused || reduced) return undefined
    const id = setInterval(() => setIndex((value) => (value + 1) % SLIDES.length), 7000)
    return () => clearInterval(id)
  }, [paused])

  const slide = SLIDES[index]
  const { mayBook } = useAuth()

  return (
    <section
      className="hero"
      id="top"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero__media" aria-hidden="true">
        {SLIDES.map((item, i) => (
          <div className={`hero__slide ${i === index ? 'is-active' : ''}`} key={item.title}>
            <img src={item.image} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        <div className="hero__scrim" />
      </div>

      <div className="container hero__inner">
        <div className="hero__copy" key={slide.title}>
          <h1 className="hero__heading">{HERO_HEADING}</h1>
          <span className="eyebrow eyebrow--onDark">{slide.eyebrow}</span>
          {/* Keeps the display treatment the h1 used to have - the hero is meant to move. */}
          <p className="hero__slogan">{slide.title}</p>
          <p className="hero__text">{slide.text}</p>
          <div className="hero__actions">
            <Link className="btn btn--cta btn--sweep" to={slide.cta.to}>
              {slide.cta.label}
              <ArrowRight width={16} height={16} />
            </Link>
            {mayBook && (
              <Link className="btn btn--onDark" to="/plan">
                Plan a custom trip
              </Link>
            )}
          </div>
        </div>

        <div className="hero__dots" role="tablist" aria-label="Featured journeys">
          {SLIDES.map((item, i) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={item.eyebrow}
              className={`hero__dot ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
