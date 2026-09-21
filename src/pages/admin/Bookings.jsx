import { useState } from 'react'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { DataTable, Dialog, Field, Notice, Segmented, StatusPill, Toolbar } from '../../components/admin/AdminUI'
import { describeError, useAdminList } from '../../components/admin/useAdmin'
import { formatDate, formatPrice } from '../../utils/format'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  // The API and the database call this REJECTED; the agency calls it cancelling a request.
  { value: 'REJECTED', label: 'Cancelled' },
]

const STATUS_LABELS = { PENDING: 'Pending', CONFIRMED: 'Confirmed', REJECTED: 'Cancelled' }

export default function AdminBookings() {
  const { token } = useAuth()
  const [status, setStatus] = useState('PENDING')

  const { rows: bookings, loading, error, reload } = useAdminList(
    () => adminApi.listBookings(token, status || null),
    [token, status]
  )

  const [confirming, setConfirming] = useState(null)
  const [confirmForm, setConfirmForm] = useState({ confirmedPrice: '', confirmedDate: '' })
  const [cancelling, setCancelling] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })

  function openConfirm(booking) {
    setConfirming(booking)
    setConfirmForm({
      confirmedPrice: booking.confirmedPrice ?? '',
      confirmedDate: booking.confirmedDate ?? '',
    })
  }

  async function submitConfirm(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await adminApi.confirmBooking(token, confirming.bookingId, {
        confirmedPrice: Number(confirmForm.confirmedPrice),
        confirmedDate: confirmForm.confirmedDate,
      })
      setConfirming(null)
      setNotice({
        kind: 'success',
        text: `Booking ${confirming.pinCode} confirmed - the customer has been emailed.`,
      })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  /**
   * Cancelling ends somebody's request and emails them about it, so it asks first: the button sits
   * next to Confirm, and one stray click should not close a booking the agency meant to take.
   */
  async function cancel(booking) {
    setBusy(true)
    try {
      await adminApi.rejectBooking(token, booking.bookingId)
      setCancelling(null)
      setNotice({
        kind: 'success',
        text: `Booking ${booking.pinCode} cancelled - the traveller has been emailed.`,
      })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Toolbar>
        <Segmented options={FILTERS} value={status} onChange={setStatus} />
        <span className="adm-toolbar__spacer" />
        <span className="adm-table__muted">
          {bookings.length} booking{bookings.length === 1 ? '' : 's'}
        </span>
      </Toolbar>

      {error && <Notice kind="error">{error}</Notice>}
      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div className="adm-card">
        <DataTable
          head={['PIN', 'Customer', 'Journey', 'Travellers', 'Travel date', 'Status', 'Price', 'Actions']}
          empty={
            bookings.length === 0
              ? {
                  title: loading ? 'Loading…' : `No ${status ? status.toLowerCase() : ''} bookings`,
                  hint: 'Change the filter, or wait for the next request.',
                }
              : null
          }
        >
          {bookings.map((booking) => (
            <tr key={booking.bookingId}>
              <td className="adm-table__strong">{booking.pinCode}</td>
              <td>
                {booking.customerName}
                <div className="adm-table__muted">{booking.customerEmail}</div>
              </td>
              <td>
                {booking.packageTitle}
                <div className="adm-table__muted">
                  {booking.destination} · {booking.numTravelers} traveller
                  {booking.numTravelers === 1 ? '' : 's'}
                </div>
              </td>
              <td>{booking.numTravelers}</td>
              <td>{booking.preferredTravelDate}</td>
              <td>
                <StatusPill value={booking.status} label={STATUS_LABELS[booking.status]} />
              </td>
              <td>
                {formatPrice(booking.confirmedPrice) ?? '—'}
                {booking.confirmedDate && <div className="adm-table__muted">{formatDate(booking.confirmedDate)}</div>}
              </td>
              <td>
                <div className="adm-table__actions">
                  {booking.status === 'PENDING' ? (
                    <>
                      <button
                        type="button"
                        className="adm-btn adm-btn--sm adm-btn--primary"
                        onClick={() => openConfirm(booking)}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--sm adm-btn--danger"
                        disabled={busy}
                        onClick={() => setCancelling(booking)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <span className="adm-table__muted">No action</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <Dialog open={Boolean(confirming)} title={`Confirm booking ${confirming?.pinCode ?? ''}`} onClose={() => setConfirming(null)}>
        {confirming && (
          <form className="adm-form" onSubmit={submitConfirm}>
            <p style={{ color: 'var(--adm-muted)', fontSize: '0.88rem' }}>
              {confirming.customerName} · {confirming.packageTitle} · {confirming.numTravelers} traveller
              {confirming.numTravelers === 1 ? '' : 's'} from {confirming.preferredTravelDate}
            </p>

            <div className="adm-grid-2">
              <Field label="Agreed price (USD)">
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={confirmForm.confirmedPrice}
                  onChange={(event) => setConfirmForm((value) => ({ ...value, confirmedPrice: event.target.value }))}
                  required
                />
              </Field>
              <Field label="Confirmed date">
                <input
                  type="date"
                  value={confirmForm.confirmedDate}
                  onChange={(event) => setConfirmForm((value) => ({ ...value, confirmedDate: event.target.value }))}
                  required
                />
              </Field>
            </div>

            <div className="adm-form__actions">
              <button type="button" className="adm-btn adm-btn--outline" onClick={() => setConfirming(null)}>
                Close
              </button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
                {busy ? 'Confirming…' : 'Confirm booking'}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog
        open={Boolean(cancelling)}
        title={`Cancel request ${cancelling?.pinCode ?? ''}`}
        onClose={() => setCancelling(null)}
      >
        {cancelling && (
          <>
            <p style={{ color: 'var(--adm-muted)', fontSize: '0.88rem' }}>
              {cancelling.customerName} ({cancelling.customerEmail}) · {cancelling.packageTitle} ·{' '}
              {cancelling.numTravelers} traveller{cancelling.numTravelers === 1 ? '' : 's'} from{' '}
              {cancelling.preferredTravelDate}
            </p>
            <p style={{ color: 'var(--adm-muted)', fontSize: '0.88rem' }}>
              The request is closed and {cancelling.customerName} is emailed to say it could not be
              confirmed. Nothing is charged either way.
            </p>
            <div className="adm-form__actions">
              <button type="button" className="adm-btn adm-btn--outline" onClick={() => setCancelling(null)}>
                Keep it pending
              </button>
              <button
                type="button"
                className="adm-btn adm-btn--danger"
                disabled={busy}
                onClick={() => cancel(cancelling)}
              >
                {busy ? 'Cancelling…' : 'Cancel the request'}
              </button>
            </div>
          </>
        )}
      </Dialog>
    </>
  )
}
