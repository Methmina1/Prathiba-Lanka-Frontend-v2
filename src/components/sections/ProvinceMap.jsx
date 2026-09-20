import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { fallbackPackages } from '../../data/fallback'
import { MAP_SOURCE, MAP_VIEW_BOX, PROVINCES } from '../../data/provinces'
import { PROVINCE_COPY } from '../../data/provinceCopy'
import { journeysInProvince } from '../../data/provincePlaces'
import { useApi } from '../../hooks/useApi'
import { formatDays, formatPrice } from '../../utils/format'
import { ArrowRight, Lock, MapPin } from '../ui/Icons'
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
 * Two ways to move around it, because hovering alone is not enough:
 *
 *   - while nothing is held, the province under the pointer is the one on show;
 *   - clicking a province **holds** it. The pointer can then leave the map, cross the other
 *     provinces on the way to the panel, and the list stays where it is. Clicking the held province
 *     again lets go, and the map goes back to following the pointer.
 *
 * Without the hold, a province in the middle of the map was almost impossible to read: every route
 * to the panel passes over its neighbours.
 */
export default function ProvinceMap() {
  const { data: packages } = useApi(() => api.getPackages(), fallbackPackages)

  const [hoveredId, setHoveredId] = useState(null)
  const [heldId, setHeldId] = useState(null)

  const activeId = heldId ?? hoveredId ?? 'central'
  const active = PROVINCES.find((province) => province.id === activeId) ?? PROVINCES[0]
  const journeys = journeysInProvince(packages, active.id)

  /** A click holds the province; a second click on the same one lets go. */
  const toggleHold = (provinceId) => {
    setHeldId((current) => (current === provinceId ? null : provinceId))
    setHoveredId(provinceId)
  }

  return (
    <section className="section" id="island">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <span className="eyebrow">The island</span>
          <h2>Nine provinces, one island</h2>
          <p className="lede">
            Every journey we run crosses at least three of them. Point at the map to see what each
            province is known for, and which journeys go through it - click one to hold it there
            while you read.
          </p>
        </Reveal>

        {/* No reset when the pointer leaves: the panel keeps the last province visited rather than
            snapping back, and the hold is what stops it following the pointer at all. */}
        <div className="island">
          <Reveal className="island__map">
            <svg
              className={`province-map ${heldId ? 'is-held' : ''}`}
              viewBox={MAP_VIEW_BOX}
              role="group"
              aria-label="Map of Sri Lanka showing its nine provinces"
              data-source={MAP_SOURCE}
              data-held={heldId ?? ''}
            >
              {PROVINCES.map((province) => (
                <path
                  key={province.id}
                  className={`province-map__shape ${province.id === activeId ? 'is-active' : ''} ${
                    province.id === heldId ? 'is-held' : ''
                  }`}
                  d={province.d}
                  tabIndex={0}
                  role="button"
                  aria-label={`${province.name} Province`}
                  aria-pressed={province.id === heldId}
                  onMouseEnter={() => setHoveredId(province.id)}
                  onFocus={() => setHoveredId(province.id)}
                  onClick={() => toggleHold(province.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggleHold(province.id)
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
              <div className="island__head">
                <span className="island__capital">
                  <MapPin width={15} height={15} />
                  {active.capital}
                </span>

                <button
                  type="button"
                  className={`island__hold ${heldId ? 'is-held' : ''}`}
                  onClick={() => toggleHold(active.id)}
                  aria-pressed={Boolean(heldId)}
                  title={
                    heldId
                      ? 'Click to release, and let the map follow the pointer again'
                      : 'Click to hold this province while you read'
                  }
                >
                  <Lock width={13} height={13} />
                  {heldId ? 'Held' : 'Hold'}
                </button>
              </div>

              <h3>{active.name} Province</h3>
              {/* The written description, with the generated one-liner as the fallback. */}
              <p className="island__about">{PROVINCE_COPY[active.id] ?? active.blurb}</p>
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
                    onClick={() => toggleHold(province.id)}
                    onMouseEnter={() => setHoveredId(province.id)}
                    aria-pressed={province.id === heldId}
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
          </Reveal>
        </div>
      </div>
    </section>
  )
}
