import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { fallbackPackages, fallbackReviews } from '../data/fallback'
import { useResource } from '../hooks/useResource'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import Scenery from '../components/ui/Scenery'
import MediaFigure from '../components/ui/MediaFigure'
import { ArrowRight, Calendar, Check, MapPin, Phone, Star, Users } from '../components/ui/Icons'
import { firstSentence, formatDate, formatDays, formatPrice, toLines } from '../utils/format'

const SCENERY = ['temple', 'safari', 'tea', 'coast', 'train', 'hills']

/** Loads a related list (gallery, reviews) only once the main record resolved; never throws. */
function useRelatedList(enabled, loader, key) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!enabled) {
      setRows([])
      return undefined
    }
    let active = true
    loader()
      .then((data) => {
        if (active) setRows(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) setRows([])
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key])

  return rows
}

/**
 * The detail page always resolves to something: a real package from the API, or - when the API is
 * down or the id belongs to the sample data used on the home page - the matching sample journey,
 * with a note explaining which one you are looking at.
 */
export default function JourneyDetail() {
  const { id } = useParams()
  const { status, data } = useResource(() => api.getPackage(id), [id])

  const sample = fallbackPackages.find((pkg) => String(pkg.packageId) === String(id))
  const pkg = status === 'ready' ? data : sample
  const isSample = status !== 'ready' && Boolean(sample)

  const gallery = useRelatedList(status === 'ready', () => api.getGalleryByPackage(id), id)
  const reviews = useRelatedList(status === 'ready', () => api.getReviewsByPackage(id), id)

  if (!pkg) {
    return (
      <main className="page-enter">
        <PageHero
          eyebrow="Not found"
          title="We cannot find that journey"
          lede="It may have been removed, or the link may be wrong. The rest of the collection is still here."
          crumbs={[{ label: 'Journeys', to: '/journeys' }, { label: 'Not found' }]}
        />
        <section className="section">
          <div className="container empty-state">
            <Link className="btn btn--cta btn--sweep" to="/journeys">
              Back to all journeys
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const scenery = pkg.scenery ?? SCENERY[Number(pkg.packageId) % SCENERY.length] ?? 'hills'
  const price = formatPrice(pkg.price)
  // One line per day, not one paragraph per blank line: a 20-day itinerary stored as 20 lines has
  // to become 20 steps.
  const itinerary = toLines(pkg.itinerary)
  const shownReviews = reviews.length > 0 ? reviews : isSample ? fallbackReviews.slice(0, 2) : []

  return (
    <main className="page-enter">
      <PageHero
        eyebrow={pkg.destination ?? 'Journey'}
        title={pkg.title}
        // The lede is the opening line; the whole description - hotels, accommodation tier and
        // inclusions included - follows under "About this journey".
        lede={firstSentence(pkg.description)}
        crumbs={[{ label: 'Journeys', to: '/journeys' }, { label: pkg.title }]}
        image={pkg.imageUrl ? api.mediaUrl(pkg.imageUrl) : undefined}
        scenery={scenery}
      />

      <section className="section">
        <div className="container detail">
          <div className="detail__main">
            {isSample && (
              <p className="notice">
                This is one of the sample journeys - the backend has no package with this id.
              </p>
            )}

            <Reveal>
              <h2>About this journey</h2>
              <p className="lede">{pkg.description}</p>
            </Reveal>

            {itinerary.length > 0 && (
              <Reveal delay={80}>
                <h3 className="detail__subhead">Day by day</h3>
                <ul className="itinerary">
                  {itinerary.map((line, index) => (
                    <li key={index}>
                      <span className="itinerary__step">{String(index + 1).padStart(2, '0')}</span>
                      <p>{line}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal delay={120}>
              <h3 className="detail__subhead">From the road</h3>
              {gallery.length > 0 ? (
                <div className="detail__strip">
                  {gallery.slice(0, 3).map((image) => (
                    <figure key={image.imageId}>
                      <MediaFigure item={image} alt={image.caption ?? pkg.title} />
                      {image.caption && <figcaption>{image.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="detail__strip">
                  <figure>
                    <Scenery variant={scenery} ratio="4 / 3" />
                    <figcaption>{pkg.destination ?? 'On the road'}</figcaption>
                  </figure>
                  <figure>
                    <Scenery variant="coast" ratio="4 / 3" />
                    <figcaption>Coastal days</figcaption>
                  </figure>
                  <figure>
                    <Scenery variant="temple" ratio="4 / 3" />
                    <figcaption>Cultural stops</figcaption>
                  </figure>
                </div>
              )}
            </Reveal>

            <Reveal delay={140}>
              <h3 className="detail__subhead">Travellers who took this journey</h3>
              {shownReviews.length === 0 ? (
                <p className="muted">No reviews for this journey yet.</p>
              ) : (
                <div className="grid grid--2">
                  {shownReviews.slice(0, 2).map((review) => (
                    <figure className="card review-card" key={review.reviewId}>
                      <div className="review-card__stars" aria-label={`${review.rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star key={value} filled={value <= review.rating} width={15} height={15} />
                        ))}
                      </div>
                      <blockquote>{review.comment}</blockquote>
                      <figcaption>
                        <strong>{review.customerName}</strong>
                        <span>{formatDate(review.createdAt) ?? 'Recent'}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </Reveal>
          </div>

          <aside className="detail__side">
            <div className="card quote-card">
              <div className="quote-card__price">
                {price ? (
                  <>
                    <small>from</small>
                    <strong>{price}</strong>
                    <small>per person</small>
                  </>
                ) : (
                  <strong>On request</strong>
                )}
              </div>

              <ul className="quote-card__facts">
                {pkg.durationDays && (
                  <li>
                    <Calendar width={16} height={16} />
                    {formatDays(pkg.durationDays)}
                  </li>
                )}
                {pkg.destination && (
                  <li>
                    <MapPin width={16} height={16} />
                    {pkg.destination}
                  </li>
                )}
                {pkg.maxCapacity && (
                  <li>
                    <Users width={16} height={16} />
                    Up to {pkg.maxCapacity} travellers
                  </li>
                )}
                <li>
                  <Check width={16} height={16} />
                  Private guide and vehicle
                </li>
              </ul>

              <Link className="btn btn--cta btn--sweep btn--block" to="/plan">
                Request this journey
                <ArrowRight width={15} height={15} />
              </Link>

              <p className="quote-card__note">
                No payment now. We reply with an itinerary and a price, usually within one working
                day.
              </p>

              <a className="quote-card__phone" href="tel:+94770000000">
                <Phone width={15} height={15} />
                +94 77 000 0000
              </a>
            </div>

            <div className="card quote-card quote-card--soft">
              <h4>Prefer to change it?</h4>
              <p>
                Every journey here is a starting point. Add a day in the hills, swap a safari for a
                cooking class, or slow the whole thing down.
              </p>
              <Link className="link-arrow" to="/plan">
                Build a custom itinerary
                <ArrowRight width={15} height={15} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
