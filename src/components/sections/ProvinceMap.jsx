import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { fallbackPackages } from '../../data/fallback'
import { MAP_SOURCE, MAP_VIEW_BOX, PROVINCES } from '../../data/provinces'
import { journeysInProvince } from '../../data/provincePlaces'
import { useApi } from '../../hooks/useApi'
import { formatDays, formatPrice } from '../../utils/format'
import { ArrowRight, MapPin } from '../ui/Icons'
import Reveal from '../ui/Reveal'

/** How many journeys the panel lists before it offers the rest. */
const LISTED = 3

/**
 * The island, province by province.
 *
 * The nine shapes in src/data/provinces.js are placed where they belong, so the outline that comes
 * out of them is Sri Lanka rather than nine drawings near each other. Running the pointer across the
 * map names each province and lists the journeys whose itineraries go through it - which is the
 * question the map exists to answer - and every one of them is a link into the catalogue.
 *
 * Hovering moves the selection; clicking pins it, so the list stays put while you read it. Leaving
 * the whole section drops back to the pinned province.
 */
export default function ProvinceMap() {
  const { data: packages } = useApi(() => api.getPackages(), fallbackPackages)

  const [hoveredId, setHoveredId] = useState(null)
  const [pinnedId, setPinnedId] = useState('central')

  const activeId = hoveredId ?? pinnedId
  const active = PROVINCES.find((province) => province.id === activeId) ?? PROVINCES[0]
  const journeys = journeysInProvince(packages, active.id)

  const select = (provinceId) => {
    setHoveredId(provinceId)
    setPinnedId(provinceId)
  }

  return (
    <section className="section" id="island">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <span className="eyebrow">The island</span>
          <h2>Nine provinces, one island</h2>
          <p className="lede">
            Every journey we run crosses at least three of them. Point at the map to see what each
            province is known for, and which journeys go through it.
          </p>
        </Reveal>

        {/* Leaving the section drops the hover, which falls back to whichever province was clicked */}
        <div className="island" onMouseLeave={() => setHoveredId(null)}>
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
                  aria-pressed={province.id === pinnedId}
                  onMouseEnter={() => setHoveredId(province.id)}
                  onFocus={() => setHoveredId(province.id)}
                  onClick={() => select(province.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      select(province.id)
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

              <div className="island__journeys">
                <h4>
                  {journeys.length === 0
                    ? 'No fixed journey stops here yet'
                    : `${journeys.length} journey${journeys.length === 1 ? '' : 's'} through ${active.name}`}
                </h4>

                {journeys.length > 0 ? (
                  <ul className="island__journey-list">
                    {journeys.slice(0, LISTED).map(({ pkg, days }) => {
                      const price = formatPrice(pkg.price)
                      const length = formatDays(pkg.durationDays)
                      return (
                        <li key={pkg.packageId}>
                          <Link className="island__journey" to={`/journeys/${pkg.packageId}`}>
                            <span className="island__journey-name">{pkg.title}</span>
                            <span className="island__journey-meta">
                              {[
                                days > 0 && length ? `${days} of ${length} here` : length,
                                price ? `from ${price}` : 'price on request',
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                            <ArrowRight width={14} height={14} />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="island__journey-empty">
                    We still build trips here — tell us your dates and we will draft one.
                  </p>
                )}

                {journeys.length > LISTED && (
                  <Link className="link-arrow" to="/journeys">
                    All {journeys.length} journeys
                    <ArrowRight width={15} height={15} />
                  </Link>
                )}
              </div>
            </div>

            <ul className="island__list">
              {PROVINCES.map((province) => (
                <li key={province.id}>
                  <button
                    type="button"
                    className={`island__pick ${province.id === activeId ? 'is-active' : ''}`}
                    onClick={() => select(province.id)}
                    onMouseEnter={() => setHoveredId(province.id)}
                    aria-pressed={province.id === pinnedId}
                  >
                    {province.name}
                  </button>
                </li>
              ))}
            </ul>

            <Link className="link-arrow" to="/journeys">
              See every journey
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
