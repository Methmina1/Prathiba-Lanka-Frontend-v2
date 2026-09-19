import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { DataTable, Notice, StatusPill } from '../../components/admin/AdminUI'
import { useAdminList } from '../../components/admin/useAdmin'
import { formatDate, formatPrice } from '../../utils/format'

export default function AdminOverview() {
  const { token } = useAuth()

  const { rows, loading, error } = useAdminList(async () => {
    const [packages, bookings, queries, journal, gallery, reviews] = await Promise.all([
      adminApi.listPackages(token),
      adminApi.listBookings(token),
      adminApi.listQueries(token),
      adminApi.listJournal(token),
      api.getGallery(),
      api.getReviews(),
    ])
    return [{ packages, bookings, queries, journal, gallery, reviews }]
  }, [token])

  const snapshot = rows[0] ?? {}
  const bookings = [...(snapshot.bookings ?? [])].sort((a, b) => b.bookingId - a.bookingId)
  const queries = [...(snapshot.queries ?? [])].sort((a, b) =>
    String(b.submittedAt ?? '').localeCompare(String(a.submittedAt ?? ''))
  )

  const countBy = (list, predicate) => list.filter(predicate).length
  const pending = countBy(bookings, (row) => row.status === 'PENDING')
  const confirmed = countBy(bookings, (row) => row.status === 'CONFIRMED')
  const rejected = countBy(bookings, (row) => row.status === 'REJECTED')
  const newQueries = countBy(queries, (row) => row.status === 'NEW')
  const activePackages = countBy(snapshot.packages ?? [], (row) => row.status === 'ACTIVE')
  const published = countBy(snapshot.journal ?? [], (row) => row.status === 'PUBLISHED')
  const drafts = (snapshot.journal ?? []).length - published

  return (
    <>
      {error && <Notice kind="error">{error}</Notice>}

      <div className="adm-stats">
        <div className="adm-card adm-stat">
          <span className="adm-stat__label">Awaiting decision</span>
          <span className="adm-stat__value">{loading ? '–' : pending}</span>
          <span className="adm-stat__meta">
            {confirmed} confirmed · {rejected} rejected
          </span>
        </div>

        <div className="adm-card adm-stat">
          <span className="adm-stat__label">New enquiries</span>
          <span className="adm-stat__value">{loading ? '–' : newQueries}</span>
          <span className="adm-stat__meta">{queries.length} in total</span>
        </div>

        <div className="adm-card adm-stat">
          <span className="adm-stat__label">Packages live</span>
          <span className="adm-stat__value">{loading ? '–' : activePackages}</span>
          <span className="adm-stat__meta">{(snapshot.packages ?? []).length} in the catalogue</span>
        </div>

        <div className="adm-card adm-stat">
          <span className="adm-stat__label">Journal</span>
          <span className="adm-stat__value">{loading ? '–' : published}</span>
          <span className="adm-stat__meta">{drafts} draft(s) unpublished</span>
        </div>
      </div>

      <div className="adm-stats">
        <div className="adm-card adm-stat">
          <span className="adm-stat__label">Gallery</span>
          <span className="adm-stat__value">{loading ? '–' : (snapshot.gallery ?? []).length}</span>
          <span className="adm-stat__meta">images published</span>
        </div>
        <div className="adm-card adm-stat">
          <span className="adm-stat__label">Reviews</span>
          <span className="adm-stat__value">{loading ? '–' : (snapshot.reviews ?? []).length}</span>
          <span className="adm-stat__meta">published by customers</span>
        </div>
        <div className="adm-card adm-stat">
          <span className="adm-stat__label">Quick actions</span>
          <span className="adm-stat__meta adm-stat__links">
            <Link className="adm-btn adm-btn--sm adm-btn--outline" to="/admin/bookings">
              Review bookings
            </Link>
            <Link className="adm-btn adm-btn--sm adm-btn--outline" to="/admin/queries">
              Answer enquiries
            </Link>
          </span>
        </div>
        <div className="adm-card adm-stat">
          <span className="adm-stat__label">Storefront</span>
          <span className="adm-stat__meta adm-stat__links">
            <Link className="adm-btn adm-btn--sm adm-btn--outline" to="/admin/packages">
              Manage packages
            </Link>
            <Link className="adm-btn adm-btn--sm adm-btn--outline" to="/admin/journal">
              Write a story
            </Link>
          </span>
        </div>
      </div>

      <div className="adm-card" style={{ marginBottom: '1.5rem' }}>
        <div className="adm-card__head">
          <div>
            <h2>Latest booking requests</h2>
            <p>The newest five, whatever their status.</p>
          </div>
          <Link className="adm-btn adm-btn--sm adm-btn--outline" to="/admin/bookings">
            All bookings
          </Link>
        </div>

        <DataTable
          head={['PIN', 'Customer', 'Journey', 'Travellers', 'Travel date', 'Status', 'Price']}
          empty={
            bookings.length === 0
              ? { title: loading ? 'Loading…' : 'No bookings yet', hint: 'Requests appear here as soon as customers send them.' }
              : null
          }
        >
          {bookings.slice(0, 5).map((row) => (
            <tr key={row.bookingId}>
              <td className="adm-table__strong">{row.pinCode}</td>
              <td>
                {row.customerName}
                <div className="adm-table__muted">{row.customerEmail}</div>
              </td>
              <td>
                {row.packageTitle}
                <div className="adm-table__muted">{row.destination}</div>
              </td>
              <td>{row.numTravelers}</td>
              <td>{row.preferredTravelDate}</td>
              <td>
                <StatusPill value={row.status} />
              </td>
              <td>{formatPrice(row.confirmedPrice) ?? '—'}</td>
            </tr>
          ))}
        </DataTable>
      </div>

      <div className="adm-card">
        <div className="adm-card__head">
          <div>
            <h2>Recent enquiries</h2>
            <p>Straight from the contact form.</p>
          </div>
          <Link className="adm-btn adm-btn--sm adm-btn--outline" to="/admin/queries">
            All enquiries
          </Link>
        </div>

        <DataTable
          head={['From', 'Subject', 'Received', 'Status']}
          empty={
            queries.length === 0
              ? { title: loading ? 'Loading…' : 'No enquiries yet', hint: 'Messages from /contact land here.' }
              : null
          }
        >
          {queries.slice(0, 5).map((row) => (
            <tr key={row.queryId}>
              <td>
                {row.name}
                <div className="adm-table__muted">{row.email}</div>
              </td>
              <td>{row.subject}</td>
              <td>{formatDate(row.submittedAt) ?? '—'}</td>
              <td>
                <StatusPill value={row.status} />
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  )
}
