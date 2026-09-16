import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { DataTable, Dialog, Notice, Toolbar } from '../../components/admin/AdminUI'
import { describeError, useAdminList } from '../../components/admin/useAdmin'
import { formatDate } from '../../utils/format'

function Stars({ rating }) {
  return <span style={{ color: '#d97706', letterSpacing: '2px' }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

export default function AdminReviews() {
  const { token } = useAuth()
  const { rows: reviews, loading, error, reload } = useAdminList(() => api.getReviews(), [])

  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function remove(review) {
    setBusy(true)
    try {
      await adminApi.deleteReview(token, review.reviewId)
      setNotice({ kind: 'success', text: 'Review removed from the public page.' })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  const average =
    reviews.length > 0
      ? (reviews.reduce((total, review) => total + (Number(review.rating) || 0), 0) / reviews.length).toFixed(1)
      : null

  return (
    <>
      <Toolbar>
        <span className="adm-table__muted">
          {reviews.length} review{reviews.length === 1 ? '' : 's'}
          {average ? ` · ${average} average` : ''}
        </span>
      </Toolbar>

      {error && <Notice kind="error">{error}</Notice>}
      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div className="adm-card">
        <DataTable
          head={['Customer', 'Journey', 'Rating', 'Comment', 'Written', 'Actions']}
          empty={
            reviews.length === 0
              ? { title: loading ? 'Loading…' : 'No reviews yet', hint: 'Customers can review from their account page.' }
              : null
          }
        >
          {reviews.map((review) => (
            <tr key={review.reviewId}>
              <td className="adm-table__strong">{review.customerName}</td>
              <td>
                {review.packageTitle ? (
                  <Link to={`/journeys/${review.packageId}`}>{review.packageTitle}</Link>
                ) : (
                  <span className="adm-table__muted">General review</span>
                )}
              </td>
              <td>
                <Stars rating={Number(review.rating) || 0} />
              </td>
              <td style={{ maxWidth: 420 }}>{review.comment}</td>
              <td>{formatDate(review.createdAt) ?? '—'}</td>
              <td>
                <div className="adm-table__actions">
                  <button
                    type="button"
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => setConfirmDelete(review)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <Dialog open={Boolean(confirmDelete)} title="Delete review" onClose={() => setConfirmDelete(null)}>
        <p style={{ marginBottom: '1rem', color: 'var(--adm-muted)' }}>
          Delete the review by <strong>{confirmDelete?.customerName}</strong>? It disappears from the
          public reviews page immediately.
        </p>
        <div className="adm-form__actions">
          <button type="button" className="adm-btn adm-btn--outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--danger"
            disabled={busy}
            onClick={() => {
              const target = confirmDelete
              setConfirmDelete(null)
              remove(target)
            }}
          >
            Delete
          </button>
        </div>
      </Dialog>
    </>
  )
}
