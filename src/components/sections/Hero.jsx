import { useEffect, useState } from 'react'
import Scenery from '../ui/Scenery'
import { ArrowRight } from '../ui/Icons'

const SLIDES = [
  {
    scenery: 'hills',
    eyebrow: 'Sri Lanka',
    title: 'The emerald isle, unhurried',
    text: 'Private journeys for travellers who would rather see four places properly than fourteen badly.',
    cta: { label: 'Explore journeys', href: '#journeys' },
  },
  {
    scenery: 'temple',
    eyebrow: 'Cultural Triangle',
    title: 'Sacred summits, stone cities',
    text: 'Sigiriya before the heat, Dambulla at noon, Polonnaruwa by bicycle and Kandy as the light goes.',
    cta: { label: 'Cultural journeys', href: '#journeys' },
  },
  {
    scenery: 'safari',
    eyebrow: 'Wildlife',
    title: 'Leopards at first light',
    text: 'Dawn drives in Yala, the great elephant gathering at Minneriya, whales off the south coast in season.',
    cta: { label: 'Safari journeys', href: '#journeys' },
  },
  {
    scenery: 'tea',
    eyebrow: 'Hill Country',
    title: 'Mist, tea and slow trains',
    text: 'The Kandy to Ella line, planter bungalows, and mornings that smell of eucalyptus and rain.',
    cta: { label: 'Hill country journeys', href: '#journeys' },
  },
]

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
            <Scenery variant={item.scenery} ratio="16 / 9" />
          </div>
        ))}
        <div className="hero__scrim" />
      </div>

      <div className="container hero__inner">
        <div className="hero__copy" key={slide.title}>
          <span className="eyebrow eyebrow--onDark">{slide.eyebrow}</span>
          <h1>{slide.title}</h1>
          <p className="hero__text">{slide.text}</p>
          <div className="hero__actions">
            <a className="btn btn--cta" href={slide.cta.href}>
              {slide.cta.label}
              <ArrowRight width={16} height={16} />
            </a>
            <a className="btn btn--onDark" href="#plan">
              Plan a custom trip
            </a>
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
