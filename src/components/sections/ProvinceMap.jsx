import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MAP_SOURCE, MAP_VIEW_BOX, PROVINCES } from '../../data/provinces'
import { ArrowRight, MapPin } from '../ui/Icons'
import Reveal from '../ui/Reveal'

/**
 * The island, province by province.
 *
 * The nine shapes in src/data/provinces.js are placed where they belong, so the outline that comes
 * out of them is Sri Lanka rather than nine drawings near each other. Pointing at a province - or
 * focusing it, or picking it from the list - names it and says what is there.
 *
 * The geometry is generated (scripts/build-province-map.mjs), not hand-drawn: this map makes a
 * factual claim about where each province is, so it is built from real district boundaries.
 */
export default function ProvinceMap() {
  const [activeId, setActiveId] = useState('central')
  const active = PROVINCES.find((province) => province.id === activeId) ?? PROVINCES[0]

  return (
    <section className="section" id="island">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <span className="eyebrow">The island</span>
          <h2>Nine provinces, one island</h2>
          <p className="lede">
            Every journey we run crosses at least three of them. Point at the map to see what each
            province is known for.
          </p>
        </Reveal>

        <div className="island">
          <Reveal className="island__map">
            <svg
              className="province-map"
              viewBox={MAP_VIEW_BOX}
              role="group"
              aria-label="Map of Sri Lanka showing its nine provinces"
              data-source={MAP_SOURCE}
            >
              {PROVINCES.map((province) => (
                <path
                  key={province.id}
                  className={`province-map__shape ${province.id === activeId ? 'is-active' : ''}`}
                  d={province.d}
                  tabIndex={0}
                  role="button"
                  aria-label={`${province.name} Province`}
                  aria-pressed={province.id === activeId}
                  onMouseEnter={() => setActiveId(province.id)}
                  onFocus={() => setActiveId(province.id)}
                  onClick={() => setActiveId(province.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setActiveId(province.id)
                    }
                  }}
                >
                  <title>{province.name} Province</title>
                </path>
              ))}
            </svg>
          </Reveal>

          <Reveal className="island__panel" delay={120}>
            <div className="card island__card" aria-live="polite">
              <span className="island__capital">
                <MapPin width={15} height={15} />
                {active.capital}
              </span>
              <h3>{active.name} Province</h3>
              <p>{active.blurb}</p>
              <ul className="island__districts">
                {active.districts.map((district) => (
                  <li key={district}>{district}</li>
                ))}
              </ul>
            </div>

            <ul className="island__list">
              {PROVINCES.map((province) => (
                <li key={province.id}>
                  <button
                    type="button"
                    className={`island__pick ${province.id === activeId ? 'is-active' : ''}`}
                    onClick={() => setActiveId(province.id)}
                    onMouseEnter={() => setActiveId(province.id)}
                    aria-pressed={province.id === activeId}
                  >
                    {province.name}
                  </button>
                </li>
              ))}
            </ul>

            <Link className="link-arrow" to="/journeys">
              See the journeys
              <ArrowRight width={15} height={15} />
            </Link>

            <p className="island__credit">
              Province boundaries from{' '}
              <a href="https://www.npmjs.com/package/@svg-maps/sri-lanka" rel="noreferrer noopener" target="_blank">
                @svg-maps/sri-lanka
              </a>
              , used under CC BY 4.0.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
