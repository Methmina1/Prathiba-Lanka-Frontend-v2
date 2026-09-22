import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { formatDays } from '../../utils/format'
import { useAuth } from '../../auth/AuthContext'
import { ArrowRight, Check, Lock } from '../ui/Icons'

/** Today, as the date input wants it (yyyy-mm-dd). */
const today = () => new Date().toISOString().slice(0, 10)

const EMPTY = { packageId: '', numTravelers: 2, preferredTravelDate: '', specialRequests: '' }

/**
 * Request a journey: the form behind the "Request" button on a journey card.
 *
 * It is the only form on the site a visitor can send without an account, because asking about a
 * journey should not require registering first. What comes back is a PIN, which is also emailed -
 * that PIN is how the request is tracked afterwards, from the tracker beside this form.
 *
 * The journey is a dropdown rather than a line of text: arriving from a card pre-selects that
 * journey (`/plan?package=12`), and somebody who lands on /plan directly can pick one without going
 * back to the catalogue. `signedIn` controls whether the name and email are filled from the account
 * or typed in - the server decides which of the two it trusts (see BookingService).
 */
export default function BookingForm({ initialPackageId = '' }) {
  const { session, email, token } = useAuth()
  const { data: packages, status } = useApi(() => api.getPackages(), [])

  const [form, setForm] = useState({ ...EMPTY, packageId: initialPackageId })
  const [state, setState] = useState({ status: 'idle', message: '', booking: null })

  // The catalogue arrives after the first render, so a journey named in the URL has to be applied
  // once it does - and only while nothing has been chosen by hand.
  useEffect(() => {
    if (initialPackageId && !form.packageId) {
      setForm((value) => ({ ...value, packageId: initialPackageId }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPackageId])

  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }))

  const selected = packages.find((pkg) => String(pkg.packageId) === String(form.packageId))

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'sending', message: '', booking: null })

    try {
      const booking = await api.requestBooking(
        {
          packageId: Number(form.packageId),
          numTravelers: Number(form.numTravelers),
          preferredTravelDate: form.preferredTravelDate,
          specialRequests: form.specialRequests || null,
          // Ignored by the server for a signed-in customer, whose account details win.
          contactName: session ? undefined : form.contactName,
          contactEmail: session ? undefined : form.contactEmail,
        },
        token
      )

      setState({ status: 'sent', message: '', booking })
      setForm({ ...EMPTY })
    } catch (error) {
      const details = error.payload?.details?.join(' ')
      setState({
        status: 'error',
        booking: null,
        message:
          error.status === 400
            ? details ?? error.payload?.message ?? 'Please check the form and try again.'
            : error.status === 429
              ? 'That was a few requests in a row. Please wait a minute and try again.'
              : error.status === 403
                ? 'Staff accounts cannot request journeys - use a customer account, or sign out.'
                : `Could not send the request${error.status ? ` (${error.status})` : ''}. Is the backend running?`,
      })
    }
  }

  if (state.booking) {
    return (
      <div className="card plan__form plan__form--sent" id="request">
        <span className="eyebrow">Request received</span>
        <h3>{state.booking.packageTitle}</h3>
        <p className="plan__hint">
          {state.booking.numTravelers} traveller{state.booking.numTravelers === 1 ? '' : 's'} from{' '}
          {state.booking.preferredTravelDate}. A consultant will be in touch shortly to go through the
          dates, the hotels and the price.
        </p>

        <div className="booking-pin">
          <span className="booking-pin__label">Your tracking PIN</span>
          <strong className="booking-pin__value">{state.booking.pinCode}</strong>
          <span className="booking-pin__note">
            {session ? 'It is on your account page as well.' : 'It is in your inbox as well. Keep it.'}
          </span>
        </div>

        <a className="btn btn--cta btn--sweep btn--block" href="#track">
          Track this request
          <ArrowRight width={15} height={15} />
        </a>
        <button type="button" className="btn btn--ghost btn--block" onClick={() => setState({ status: 'idle', message: '', booking: null })}>
          Request another journey
        </button>
      </div>
    )
  }

  return (
    <form className="card plan__form" id="request" onSubmit={submit}>
      <h3>Request a journey</h3>
      <p className="plan__hint">
        Tell us which journey and when. You get a PIN straight away - no account needed - and a
        consultant replies with an itinerary and a price.
      </p>

      <div className="field">
        <label htmlFor="bookingPackage">Journey</label>
        <select
          id="bookingPackage"
          value={form.packageId}
          onChange={update('packageId')}
          required
          disabled={status === 'loading'}
        >
          <option value="">Choose a journey…</option>
          {packages.map((pkg) => (
            <option key={pkg.packageId} value={pkg.packageId}>
              {pkg.title}
              {pkg.durationDays ? ` — ${formatDays(pkg.durationDays)}` : ''}
            </option>
          ))}
        </select>
        {selected?.destination && <span className="field__hint">{selected.destination}</span>}
        {status === 'fallback' && (
          <span className="field__hint">
            The catalogue could not be loaded just now - the enquiry form below still reaches us.
          </span>
        )}
      </div>

      {session ? (
        <p className="plan__signed-in">
          <Lock width={14} height={14} />
          Requesting as {email ?? 'your account'} - it will appear on your account page.
        </p>
      ) : (
        <>
          <div className="field">
            <label htmlFor="contactName">Your name</label>
            <input id="contactName" value={form.contactName ?? ''} onChange={update('contactName')} required maxLength={100} />
          </div>

          <div className="field">
            <label htmlFor="contactEmail">Email</label>
            <input
              id="contactEmail"
              type="email"
              value={form.contactEmail ?? ''}
              onChange={update('contactEmail')}
              required
              placeholder="So we can reply, and send your PIN"
            />
          </div>
        </>
      )}

      <div className="plan__row">
        <div className="field">
          <label htmlFor="bookingTravelers">Travellers</label>
          <input
            id="bookingTravelers"
            type="number"
            min={1}
            max={50}
            value={form.numTravelers}
            onChange={update('numTravelers')}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="bookingDate">Preferred date</label>
          <input
            id="bookingDate"
            type="date"
            min={today()}
            value={form.preferredTravelDate}
            onChange={update('preferredTravelDate')}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="bookingRequests">Anything we should know?</label>
        <textarea
          id="bookingRequests"
          rows={3}
          value={form.specialRequests}
          onChange={update('specialRequests')}
          placeholder="Rooms, dietary needs, a slower pace, an extra day somewhere…"
        />
      </div>

      <button className="btn btn--cta btn--sweep btn--block" type="submit" disabled={state.status === 'sending'}>
        {state.status === 'sending' ? 'Sending…' : 'Request this journey'}
      </button>

      {state.message && <p className={`form-note form-note--${state.status}`}>{state.message}</p>}

      <p className="plan__api">
        Posts to <code>/api/bookings/request</code>. You get a PIN back, and an email confirming the
        request is pending.
      </p>

      <p className="plan__aside-link">
        <Check width={14} height={14} />
        Not about a particular journey?{' '}
        <a href="#enquiry">Send a general enquiry</a> instead.
      </p>
    </form>
  )
}
