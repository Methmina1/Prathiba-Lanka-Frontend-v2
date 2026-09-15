import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { ArrowRight, Search } from '../ui/Icons'

const STATUS_CLASS = {
  PENDING: 'pill--pending',
  CONFIRMED: 'pill--confirmed',
  REJECTED: 'pill--rejected',
}

/** PIN lookup against GET /api/bookings/track?pin= - no account needed. */
export default function TrackBooking() {
  const [pin, setPin] = useState('')
  const [state, setState] = useState({ status: 'idle', booking: null, message: '' })
  const inputRef = useRef(null)

  // Arriving from the header link (/plan#track) puts the cursor straight in the field.
  useEffect(() => {
    if (window.location.hash === '#track') {
      inputRef.current?.focus()
    }
  }, [])

  async function submit(event) {
    event.preventDefault()
    const value = pin.trim().toUpperCase()
    if (!value) return

    setState({ status: 'loading', booking: null, message: '' })
    try {
      const booking = await api.trackBooking(value)
      setState({ status: 'found', booking, message: '' })
    } catch (error) {
      setState({
        status: 'error',
        booking: null,
        message:
          error.status === 404
            ? `No booking found for PIN ${value}.`
            : `Could not reach the booking service${error.status ? ` (${error.status})` : ''}.`,
      })
    }
  }

  const { status, booking, message } = state

  return (
    <div className="card plan__track" id="track">
      <h3>Track a booking</h3>
      <p className="plan__hint">
        Every request gets an eight-character PIN by email. Enter it here to see its status.
      </p>

      <form className="pin" onSubmit={submit}>
        <Search width={18} height={18} />
        <input
          id="pin-input"
          ref={inputRef}
          value={pin}
          onChange={(event) => setPin(event.target.value.toUpperCase())}
          placeholder="e.g. 4F9C2A7B"
          maxLength={10}
          aria-label="Booking PIN"
        />
        <button className="btn btn--cta btn--sm" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '…' : 'Track'}
        </button>
      </form>

      {status === 'error' && <p className="form-note form-note--error">{message}</p>}

      {booking && (
        <div className="booking-result">
          <div className="booking-result__head">
            <span className={`pill ${STATUS_CLASS[booking.status] ?? 'pill--green'}`}>{booking.status}</span>
            <span className="booking-result__pin">PIN {booking.pinCode}</span>
          </div>
          <h4>{booking.packageTitle}</h4>
          <ul>
            <li>
              {booking.numTravelers} traveller{booking.numTravelers === 1 ? '' : 's'}
            </li>
            <li>Preferred {booking.preferredTravelDate}</li>
            {booking.destination && <li>{booking.destination}</li>}
          </ul>
          {booking.status === 'CONFIRMED' && (
            <p className="booking-result__price">
              Confirmed for <strong>${booking.confirmedPrice}</strong>
              {booking.confirmedDate ? ` on ${booking.confirmedDate}` : ''}
            </p>
          )}
          {booking.status === 'PENDING' && (
            <p className="booking-result__note">
              Still with a consultant - you will get an email as soon as it is confirmed.
            </p>
          )}
        </div>
      )}

      <a className="link-arrow plan__link" href="/#journeys">
        Browse the journeys
        <ArrowRight width={15} height={15} />
      </a>
      <p className="plan__api">
        Reads <code>/api/bookings/track?pin=…</code>
      </p>
    </div>
  )
}
