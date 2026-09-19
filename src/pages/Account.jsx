import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import { Calendar, Star, Users } from '../components/ui/Icons'
import { formatDate, formatPrice } from '../utils/format'

const STATUS_CLASS = {
  PENDING: 'pill--pending',
  CONFIRMED: 'pill--confirmed',
  REJECTED: 'pill--rejected',
}

const EMPTY_BOOKING = { packageId: '', numTravelers: 2, preferredTravelDate: '', specialRequests: '' }
const EMPTY_REVIEW = { packageId: '', rating: 5, comment: '' }

export default function Account() {
  const { session, token, email, isAdmin, ready, signOut } = useAuth()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const [booking, setBooking] = useState(EMPTY_BOOKING)
  const [bookingState, setBookingState] = useState({ status: 'idle', message: '' })
  const [review, setReview] = useState(EMPTY_REVIEW)
  const [reviewState, setReviewState] = useState({ status: 'idle', message: '' })

  // The account page is customer-only: signed-out visitors sign in, staff are sent to their console
  // (an admin token has no bookings to list, and the customer endpoints answer it with 403).
  //
  // `ready` matters: the session is read from localStorage in an effect, and a child's effects run
  // before the provider's, so without it this guard fired on the first render - bouncing a signed-in
  // customer to the login form every time they opened or reloaded this page.
  useEffect(() => {
    if (!ready) return
    if (!session) navigate('/login?next=/account', { replace: true })
    else if (isAdmin) navigate('/admin', { replace: true })
  }, [ready, session, isAdmin, navigate])

  useEffect(() => {
    if (!token) return undefined
    let active = true

    Promise.all([api.getMyBookings(token), api.getPackages()])
      .then(([rows, catalogue]) => {
        if (!active) return
        setBookings(Array.isArray(rows) ? rows : [])
        setPackages(Array.isArray(catalogue) ? catalogue : [])
      })
      .catch(() => active && setNotice('Could not load your bookings - is the backend running?'))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [token])

  async function submitBooking(event) {
    event.preventDefault()
    setBookingState({ status: 'sending', message: '' })
    try {
      const created = await api.requestBooking(
        {
          packageId: Number(booking.packageId),
          numTravelers: Number(booking.numTravelers),
          preferredTravelDate: booking.preferredTravelDate,
          specialRequests: booking.specialRequests || null,
        },
        token
      )
      setBookings((rows) => [created, ...rows])
      setBooking(EMPTY_BOOKING)
      setBookingState({
        status: 'sent',
        message: `Request received. Your PIN is ${created.pinCode} - keep it to track the booking.`,
      })
    } catch (error) {
      setBookingState({
        status: 'error',
        message:
          error.status === 403
            ? 'That package is not open for booking right now.'
            : error.payload?.message ?? `Could not send the request${error.status ? ` (${error.status})` : ''}.`,
      })
    }
  }

  async function submitReview(event) {
    event.preventDefault()
    setReviewState({ status: 'sending', message: '' })
    try {
      await api.submitReview(
        {
          rating: Number(review.rating),
          comment: review.comment,
          packageId: review.packageId ? Number(review.packageId) : null,
        },
        token
      )
      setReview(EMPTY_REVIEW)
      setReviewState({ status: 'sent', message: 'Thank you - your review is live on the reviews page.' })
    } catch (error) {
      setReviewState({
        status: 'error',
        message: error.payload?.message ?? `Could not save the review${error.status ? ` (${error.status})` : ''}.`,
      })
    }
  }

  if (!session) return null

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="Your account"
        title={`Welcome back${email ? `, ${email.split('@')[0]}` : ''}`}
        lede="Everything you have requested with us, plus a shortcut to request another journey or leave a review."
        crumbs={[{ label: 'Account' }]}
      >
        <button
          type="button"
          className="btn btn--onDark btn--sm"
          style={{ marginTop: '1.5rem' }}
          onClick={() => {
            signOut()
            navigate('/', { replace: true })
          }}
        >
          Sign out
        </button>
      </PageHero>

      <section className="section">
        <div className="container">
          {notice && <p className="notice">{notice}</p>}

          <Reveal>
            <h2 className="account-heading">My bookings</h2>
            {loading ? (
              <p className="muted">Loading…</p>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <h3>No bookings yet</h3>
                <p>Request a journey below and it will appear here with its PIN.</p>
                <Link className="btn btn--ghost" to="/journeys">
                  Browse the journeys
                </Link>
              </div>
            ) : (
              <div className="booking-list">
                {bookings.map((item) => (
                  <article className="card booking-row" key={item.bookingId}>
                    <div className="booking-row__head">
                      <span className={`pill ${STATUS_CLASS[item.status] ?? 'pill--green'}`}>{item.status}</span>
                      <span className="booking-result__pin">PIN {item.pinCode}</span>
                    </div>
                    <h3>{item.packageTitle}</h3>
                    <ul className="booking-row__facts">
                      <li>
                        <Users width={15} height={15} />
                        {item.numTravelers} traveller{item.numTravelers === 1 ? '' : 's'}
                      </li>
                      <li>
                        <Calendar width={15} height={15} />
                        Preferred {item.preferredTravelDate}
                      </li>
                      {item.confirmedPrice && <li>Confirmed at {formatPrice(item.confirmedPrice)}</li>}
                      {item.confirmedDate && <li>Confirmed on {formatDate(item.confirmedDate)}</li>}
                    </ul>
                    {item.specialRequests && <p className="booking-row__note">“{item.specialRequests}”</p>}
                  </article>
                ))}
              </div>
            )}
          </Reveal>

          <div className="account-grid">
            <Reveal delay={80}>
              <form className="card auth-card" onSubmit={submitBooking}>
                <h3>Request another journey</h3>
                <p className="plan__hint">We reply with an itinerary and a price, usually within a working day.</p>

                <div className="field">
                  <label htmlFor="packageId">Journey</label>
                  <select
                    id="packageId"
                    value={booking.packageId}
                    onChange={(event) => setBooking((value) => ({ ...value, packageId: event.target.value }))}
                    required
                  >
                    <option value="">Choose a journey…</option>
                    {packages.map((pkg) => (
                      <option key={pkg.packageId} value={pkg.packageId}>
                        {pkg.title}
                        {pkg.destination ? ` - ${pkg.destination}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="numTravelers">Travellers</label>
                  <input
                    id="numTravelers"
                    type="number"
                    min={1}
                    value={booking.numTravelers}
                    onChange={(event) => setBooking((value) => ({ ...value, numTravelers: event.target.value }))}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="preferredTravelDate">Preferred date</label>
                  <input
                    id="preferredTravelDate"
                    type="date"
                    value={booking.preferredTravelDate}
                    onChange={(event) =>
                      setBooking((value) => ({ ...value, preferredTravelDate: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="specialRequests">Anything we should know?</label>
                  <textarea
                    id="specialRequests"
                    rows={3}
                    value={booking.specialRequests}
                    onChange={(event) =>
                      setBooking((value) => ({ ...value, specialRequests: event.target.value }))
                    }
                  />
                </div>

                <button
                  className="btn btn--cta btn--sweep btn--block"
                  type="submit"
                  disabled={bookingState.status === 'sending'}
                >
                  {bookingState.status === 'sending' ? 'Sending…' : 'Send request'}
                </button>

                {bookingState.message && (
                  <p className={`form-note form-note--${bookingState.status}`}>{bookingState.message}</p>
                )}
                <p className="plan__api">
                  Posts to <code>/api/bookings/request</code> with your token.
                </p>
              </form>
            </Reveal>

            <Reveal delay={140}>
              <form className="card auth-card" onSubmit={submitReview}>
                <h3>Leave a review</h3>
                <p className="plan__hint">One review per journey - it appears on the reviews page straight away.</p>

                <div className="field">
                  <label htmlFor="reviewPackage">Journey (optional)</label>
                  <select
                    id="reviewPackage"
                    value={review.packageId}
                    onChange={(event) => setReview((value) => ({ ...value, packageId: event.target.value }))}
                  >
                    <option value="">General review</option>
                    {packages.map((pkg) => (
                      <option key={pkg.packageId} value={pkg.packageId}>
                        {pkg.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="rating">Rating</label>
                  <div className="rating-input" id="rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`rating-input__star ${value <= review.rating ? 'is-on' : ''}`}
                        aria-label={`${value} out of 5`}
                        onClick={() => setReview((current) => ({ ...current, rating: value }))}
                      >
                        <Star width={22} height={22} filled={value <= review.rating} />
                      </button>
                    ))}
                    <span className="rating-input__value">{review.rating}/5</span>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="comment">Your review</label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={review.comment}
                    onChange={(event) => setReview((value) => ({ ...value, comment: event.target.value }))}
                    required
                  />
                </div>

                <button
                  className="btn btn--cta btn--sweep btn--block"
                  type="submit"
                  disabled={reviewState.status === 'sending'}
                >
                  {reviewState.status === 'sending' ? 'Saving…' : 'Publish review'}
                </button>

                {reviewState.message && (
                  <p className={`form-note form-note--${reviewState.status}`}>{reviewState.message}</p>
                )}
                <p className="plan__api">
                  Posts to <code>/api/reviews</code> with your token.
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
