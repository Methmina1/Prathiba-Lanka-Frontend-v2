import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { fallbackPackages } from '../data/fallback'
import { CONTACT_FALLBACK, whatsappFrom } from '../data/social'
import { useAuth } from '../auth/AuthContext'
import { usePageContent } from '../hooks/usePageContent'
import { useResource } from '../hooks/useResource'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import Scenery from '../components/ui/Scenery'
import MediaFigure from '../components/ui/MediaFigure'
import DayAccordion from '../components/ui/DayAccordion'
import { ArrowRight, Calendar, Check, Mail, MapPin, Phone, Star, Users, WhatsApp } from '../components/ui/Icons'
import { firstSentence, formatDate, formatDays, toLines, toParagraphs } from '../utils/format'

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

  // The quote card shows whichever contact detail the agency actually publishes.
  const { mayBook, session } = useAuth()
  const { content: contact } = usePageContent('contact')
  const contactCards = contact.cards ?? []
  const phone = contactCards.find((card) => card.href?.startsWith('tel:') && card.value)
  const email = contactCards.find((card) => card.href?.startsWith('mailto:') && card.value)
  const whatsapp = whatsappFrom(contactCards)

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
  // One line per day, not one paragraph per blank line: a 20-day itinerary stored as 20 lines has
  // to become 20 days. The write-up is the other way round - paragraphs, split on blank lines.
  const itinerary = toLines(pkg.itinerary)
  const story = toParagraphs(pkg.longDescription)

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
              {/* The full write-up when there is one; the one-line summary otherwise. */}
              {story.length > 0 ? (
                <div className="detail__story">
                  {story.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="lede">{pkg.description}</p>
              )}
            </Reveal>

            {itinerary.length > 0 && (
              <Reveal delay={80}>
                <h3 className="detail__subhead">Day by day</h3>
                <DayAccordion lines={itinerary} />
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
              {reviews.length === 0 ? (
                <div className="detail__reviews-empty">
                  <p className="muted">
                    No reviews for this journey yet. They are written by customers who have been out
                    with us, and appear here unedited.
                  </p>
                  {mayBook && (
                    <Link className="link-arrow" to={session ? '/account#review' : '/login?next=/account'}>
                      {session ? 'Be the first to review it' : 'Sign in to review it'}
                      <ArrowRight width={15} height={15} />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid--2">
                  {reviews.slice(0, 2).map((review) => (
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
              {/* No price is published anywhere on the site: every journey is costed against the
                  traveller's own dates, party size and hotel choices, so a figure on the page would
                  be a number nobody is actually offered. Staff confirm the agreed price in the
                  console. */}
              <div className="quote-card__quote">
                <small>Pricing</small>
                <strong>Quoted for your trip</strong>
                <p>
                  Costed to your dates, party and hotels - ask and it comes back with the itinerary.
                </p>
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

              {/* Staff cannot book - the backend refuses an admin token with 403 - so they are not
                  offered the request button. The facts still show. */}
              {mayBook ? (
                <>
                  <Link className="btn btn--cta btn--sweep btn--block" to="/plan">
                    Request this journey
                    <ArrowRight width={15} height={15} />
                  </Link>

                  <p className="quote-card__note">
                    No payment now. We reply with an itinerary and a price, usually within one
                    working day.
                  </p>
                </>
              ) : (
                <Link className="btn btn--ghost btn--block" to="/admin/bookings">
                  This is a customer journey — open the console
                  <ArrowRight width={15} height={15} />
                </Link>
              )}

              {/* WhatsApp leads: it is the channel the agency answers on, and this is the page where
                  somebody is deciding. The number is the contact card from Admin -> Contact, not a
                  constant, so changing it there changes it here. */}
              <a
                className="quote-card__phone quote-card__phone--whatsapp"
                href={whatsapp.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Ask about ${pkg.title} on WhatsApp: ${whatsapp.value}`}
              >
                <WhatsApp width={15} height={15} />
                {whatsapp.value}
              </a>

              {/* The agency's real contact details, from the same cards the contact page edits.
                  There is no published phone number yet, so this falls back to email. */}
              {phone?.value ? (
                <a className="quote-card__phone" href={phone.href}>
                  <Phone width={15} height={15} />
                  {phone.value}
                </a>
              ) : (
                <a className="quote-card__phone" href={`mailto:${email?.value ?? CONTACT_FALLBACK.email}`}>
                  <Mail width={15} height={15} />
                  {email?.value ?? CONTACT_FALLBACK.email}
                </a>
              )}
            </div>

            <div className="card quote-card quote-card--soft">
              <h4>Prefer to change it?</h4>
              <p>
                Every journey here is a starting point. Add a day in the hills, swap a safari for a
                cooking class, or slow the whole thing down.
              </p>
              {mayBook && (
                <Link className="link-arrow" to="/plan">
                  Build a custom itinerary
                  <ArrowRight width={15} height={15} />
                </Link>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
