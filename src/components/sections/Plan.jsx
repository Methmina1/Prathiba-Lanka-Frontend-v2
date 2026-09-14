import { useState } from 'react'
import { api } from '../../api/client'
import { ArrowRight, Calendar, MapPin, Search, Users } from '../ui/Icons'

const STATUS_CLASS = {
  PENDING: 'pill--pending',
  CONFIRMED: 'pill--confirmed',
  REJECTED: 'pill--rejected',
}

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' }

export default function Plan() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [formState, setFormState] = useState({ status: 'idle', message: '' })
  const [pin, setPin] = useState('')
  const [tracking, setTracking] = useState({ status: 'idle', booking: null, message: '' })

  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }))

  async function submitQuery(event) {
    event.preventDefault()
    setFormState({ status: 'sending', message: '' })
    try {
      await api.submitQuery(form)
      setForm(EMPTY_FORM)
      setFormState({
        status: 'sent',
        message: 'Thank you - your enquiry is in. A consultant replies within one working day.',
      })
    } catch (error) {
      setFormState({
        status: 'error',
        message:
          error.status === 400
            ? 'Please check the form: name, a valid email, a subject and a message are required.'
            : `Could not send the enquiry${error.status ? ` (${error.status})` : ''}. Is the backend running?`,
      })
    }
  }

  async function trackBooking(event) {
    event.preventDefault()
    const value = pin.trim().toUpperCase()
    if (!value) return
    setTracking({ status: 'loading', booking: null, message: '' })
    try {
      const booking = await api.trackBooking(value)
      setTracking({ status: 'found', booking, message: '' })
    } catch (error) {
      setTracking({
        status: 'error',
        booking: null,
        message:
          error.status === 404
            ? `No booking found for PIN ${value}.`
            : `Could not reach the booking service${error.status ? ` (${error.status})` : ''}.`,
      })
    }
  }

  return (
    <section className="section section--tint" id="plan">
      <div className="container">
        <div className="section-head section-head--center">
          <span className="eyebrow">Start here</span>
          <h2>Plan your journey</h2>
          <p className="lede">
            Send us the outline of a trip, or look up a request you have already made with its PIN.
          </p>
        </div>

        <div className="plan">
          <form className="card plan__form" onSubmit={submitQuery}>
            <h3>Request a journey</h3>
            <p className="plan__hint">Tell us roughly when, and what you would like to see.</p>

            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" value={form.name} onChange={update('name')} required maxLength={100} />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={update('email')} required />
            </div>

            <div className="field">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                value={form.subject}
                onChange={update('subject')}
                required
                maxLength={200}
                placeholder="Two weeks in August, family of four"
              />
            </div>

            <div className="field">
              <label htmlFor="message">What would you like to see?</label>
              <textarea id="message" rows={4} value={form.message} onChange={update('message')} required />
            </div>

            <button className="btn btn--primary btn--block" type="submit" disabled={formState.status === 'sending'}>
              {formState.status === 'sending' ? 'Sending…' : 'Send enquiry'}
            </button>

            {formState.message && (
              <p className={`form-note form-note--${formState.status}`}>{formState.message}</p>
            )}
            <p className="plan__api">
              Posts to <code>/api/contact</code> on the PrathibaLanka backend.
            </p>
          </form>

          <div className="card plan__track">
            <h3>Track a booking</h3>
            <p className="plan__hint">
              Every request gets an eight-character PIN by email. Enter it here to see its status.
            </p>

            <form className="pin" onSubmit={trackBooking}>
              <Search width={18} height={18} />
              <input
                id="pin-input"
                value={pin}
                onChange={(event) => setPin(event.target.value.toUpperCase())}
                placeholder="e.g. 4F9C2A7B"
                maxLength={10}
                aria-label="Booking PIN"
              />
              <button className="btn btn--cta btn--sm" type="submit" disabled={tracking.status === 'loading'}>
                {tracking.status === 'loading' ? '…' : 'Track'}
              </button>
            </form>

            {tracking.status === 'error' && <p className="form-note form-note--error">{tracking.message}</p>}

            {tracking.booking && (
              <div className="booking-result">
                <div className="booking-result__head">
                  <span className={`pill ${STATUS_CLASS[tracking.booking.status] ?? 'pill--green'}`}>
                    {tracking.booking.status}
                  </span>
                  <span className="booking-result__pin">PIN {tracking.booking.pinCode}</span>
                </div>
                <h4>{tracking.booking.packageTitle}</h4>
                <ul>
                  <li>
                    <Users width={15} height={15} />
                    {tracking.booking.numTravelers} traveller
                    {tracking.booking.numTravelers === 1 ? '' : 's'}
                  </li>
                  <li>
                    <Calendar width={15} height={15} />
                    Preferred {tracking.booking.preferredTravelDate}
                  </li>
                  {tracking.booking.destination && (
                    <li>
                      <MapPin width={15} height={15} />
                      {tracking.booking.destination}
                    </li>
                  )}
                </ul>
                {tracking.booking.status === 'CONFIRMED' && (
                  <p className="booking-result__price">
                    Confirmed for <strong>${tracking.booking.confirmedPrice}</strong>
                    {tracking.booking.confirmedDate ? ` on ${tracking.booking.confirmedDate}` : ''}
                  </p>
                )}
                {tracking.booking.status === 'PENDING' && (
                  <p className="booking-result__note">
                    Still with a consultant - you will get an email as soon as it is confirmed.
                  </p>
                )}
              </div>
            )}

            <a className="link-arrow plan__link" href="#journeys">
              Browse the journeys
              <ArrowRight width={15} height={15} />
            </a>
            <p className="plan__api">
              Reads <code>/api/bookings/track?pin=…</code>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
