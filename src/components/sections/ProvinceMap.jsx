import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { fallbackPackages } from '../../data/fallback'
import { MAP_SOURCE, MAP_VIEW_BOX, PROVINCES } from '../../data/provinces'
import { PROVINCE_COPY } from '../../data/provinceCopy'
import { journeysInProvince, provincePhotos } from '../../data/provincePlaces'
import { provinceFacts } from '../../data/districtDetail'
import { useApi } from '../../hooks/useApi'
import { formatDays } from '../../utils/format'
import { ArrowRight, Lock, MapPin } from '../ui/Icons'
import Reveal from '../ui/Reveal'

/** How many journeys the panel lists before it offers the rest. */
const LISTED = 4

/** How many photographs of a province the panel shows. */
const PHOTOS = 4

/** What the district document calls each of its five sections, as a heading on the panel. */
const SECTION_TITLES = {
  geography: 'Geography',
  history: 'History',
  economy: 'Economy',
  tourism: 'What to see',
  culture: 'People',
}

const thousands = new Intl.NumberFormat('en-GB')

/** "1,940 km² · 1.4 million people" - the facts the document states outright, for a district's summary row. */
function districtFacts(district) {
  return [
    district.areaKm2 ? `${thousands.format(district.areaKm2)} km²` : null,
    district.population ? `${district.population} people` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

/**
 * The island, province by province.
 *
 * The map is the middle of the section, and deliberately so: the nine shapes in src/data/provinces.js
 * are placed where they belong, so the outline that comes out of them is Sri Lanka rather than nine
 * drawings near each other. Point at a province and the panel around the map answers for it -
 * **photographs of the place on the left, what it is like on the right, and the journeys that go
 * through it across the bottom**. The map itself carries no frame: it is the way in, not a card.
 *
 * "What it is like" is more than a sentence. src/data/districtDetail.js is generated from the agency's
 * own district document, so each province explains itself through its districts: the facts the document
 * states outright (area, population) and the opening of each of its five sections, opened one district
 * at a time. Nothing on this panel is invented, and nothing is tagged by hand anywhere else either.
 *
 * Two ways to move around it, because hovering alone is not enough:
 *
 *   - while nothing is held, the province under the pointer is the one on show;
 *   - clicking a province **holds** it. The pointer can then leave the map, cross the other provinces
 *     on the way to a photograph or a journey, and the panel stays where it is. Clicking the held
 *     province again lets go, and the map goes back to following the pointer.
 *
 * Hovering is what fills the panel, and it stays private to this component: `onProvince` is only told
 * what has been *held*, so the journal's note cards below cannot flicker through nine provinces on the
 * way to the one being aimed at.
 */
export default function ProvinceMap({ posts = [], onProvince }) {
  const { data: packages } = useApi(() => api.getPackages(), fallbackPackages)
  const { data: gallery } = useApi(() => api.getGallery(), [])

  const [hoveredId, setHoveredId] = useState(null)
  const [heldId, setHeldId] = useState(null)

  const activeId = heldId ?? hoveredId ?? 'central'
  const active = PROVINCES.find((province) => province.id === activeId) ?? PROVINCES[0]
  const journeys = journeysInProvince(packages, active.id)
  const photos = provincePhotos({ packages, posts, gallery }, active.id, PHOTOS)
  const facts = provinceFacts(active.id)

  /** A click holds the province; a second click on the same one lets go. */
  const toggleHold = (provinceId) => {
    const lettingGo = heldId === provinceId
    setHeldId(lettingGo ? null : provinceId)
    setHoveredId(provinceId)
    onProvince?.(lettingGo ? null : provinceId)
  }

  return (
    <section className="section" id="island">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <span className="eyebrow">The island</span>
          <h2>Nine provinces, one island</h2>
          <p className="lede">
            Every story above happened somewhere on this map, and every journey we run crosses at
            least three of the provinces. Point at one to see photographs of it, what it is like
            district by district, and which journeys go through it - click it to hold it there while
            you read.
          </p>
        </Reveal>

        {/* No reset when the pointer leaves: the panel keeps the last province visited rather than
            snapping back, and the hold is what stops it following the pointer at all. */}
        <div className="island">
          <div className="island__card" aria-live="polite">
            <div className="island__grid">
              {/* Left: what the province looks like. */}
              <div className="island__photos">
                {photos.length > 0 ? (
                  <ul className="island__photo-list">
                    {photos.map((photo) => (
                      <li key={photo.src} className="island__photo">
                        <img src={api.mediaUrl(photo.src)} alt={photo.alt} loading="lazy" />
                        {photo.caption && (
                          <span className="island__photo-caption">{photo.caption}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="island__photos-empty">
                    No photographs from {active.name} yet. Everything we run here is listed below.
                  </p>
                )}
              </div>

              {/* Middle: the island itself, with the province it is answering for above it. */}
              <div className="island__centre">
                <div className="island__head">
                  <h3>{active.name} Province</h3>

                  <div className="island__head-tools">
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
                </div>

                <div className="island__map">
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
                        {/* One string, not text plus a value: React refuses to render an array of
                            children into a <title>, and warns on every server render. */}
                        <title>{`${province.name} Province`}</title>
                      </path>
                    ))}
                  </svg>
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
              </div>

              {/* Right: what it is like - the province first, then its districts, each one openable. */}
              <div className="island__detail">
                {/* The written description, with the generated one-liner as the fallback. */}
                <p className="island__about">{PROVINCE_COPY[active.id] ?? active.blurb}</p>

                {facts.count > 0 && (
                  <p className="island__facts">
                    {[
                      `${facts.count} district${facts.count === 1 ? '' : 's'}`,
                      facts.areaKm2 ? `${thousands.format(facts.areaKm2)} km²` : null,
                      facts.populationMillions
                        ? `about ${facts.populationMillions} million people`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}

                <div className="island__districts">
                  {facts.districts.map((district) => (
                    <details className="island__district" key={district.name}>
                      <summary className="island__district-head">
                        <span className="island__district-name">{district.name}</span>
                        <span className="island__district-facts">{districtFacts(district)}</span>
                      </summary>

                      <dl className="island__district-sections">
                        {Object.entries(SECTION_TITLES).map(([key, title]) =>
                          district.sections[key] ? (
                            <div className="island__district-row" key={key}>
                              <dt>{title}</dt>
                              <dd>{district.sections[key]}</dd>
                            </div>
                          ) : null,
                        )}
                      </dl>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Across the bottom: the journeys we run through it. */}
            <div className="island__journeys">
              <h4>
                {journeys.length === 0
                  ? 'No fixed journey stops here yet'
                  : `${journeys.length} journey${journeys.length === 1 ? '' : 's'} through ${active.name}`}
              </h4>

              {journeys.length > 0 ? (
                <ul className="island__journey-list">
                  {journeys.slice(0, LISTED).map(({ pkg, days }) => {
                    const length = formatDays(pkg.durationDays)
                    return (
                      <li key={pkg.packageId}>
                        <Link className="island__journey" to={`/journeys/${pkg.packageId}`}>
                          <span className="island__journey-name">{pkg.title}</span>
                          <span className="island__journey-meta">
                            {[days > 0 && length ? `${days} of ${length} here` : length, pkg.destination]
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

          <Link className="link-arrow" to="/journeys">
            See every journey
            <ArrowRight width={15} height={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}
