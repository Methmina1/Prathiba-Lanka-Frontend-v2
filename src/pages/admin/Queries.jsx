import { useState } from 'react'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { DataTable, Dialog, Field, Notice, Segmented, StatusPill, Toolbar } from '../../components/admin/AdminUI'
import { describeError, useAdminList } from '../../components/admin/useAdmin'
import { formatDate } from '../../utils/format'

const FILTERS = [
  { value: false, label: 'All' },
  { value: true, label: 'Waiting for a reply' },
]

/**
 * Enquiries, and the conversation each one carries.
 *
 * Two kinds arrive here and they are answered differently. One about a package is a booking request with
 * a status of its own, and the automated mails for it live on the Bookings screen. Everything else is
 * this: a question, an answer, and whatever was said in between.
 *
 * The important thing this screen has to be honest about is which of the three actually happened to a
 * reply - it was emailed to the customer, it was written in the agency's own inbox, or it has not gone
 * out at all. The agency discusses the details from Gmail, so "answered from your inbox" is the normal
 * case rather than a failure, and the waiting list is only useful if it can be trusted.
 */
export default function AdminQueries() {
  const { token } = useAuth()
  const [onlyNew, setOnlyNew] = useState(true)

  const { rows: queries, loading, error, reload } = useAdminList(
    () => adminApi.listQueries(token, onlyNew),
    [token, onlyNew]
  )

  const [responding, setResponding] = useState(null)
  const [response, setResponse] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })

  function openRespond(query) {
    setResponding(query)
    // The reply box starts empty even when the enquiry has been answered before: the customer may have
    // written again, and pre-filling the previous answer invites sending it twice.
    setResponse('')
    setNotice({ kind: 'info', text: '' })
  }

  /** Keep the dialog's copy of the row in step with what the server just returned. */
  function refreshDialog(updated) {
    setResponding((current) => (current && current.queryId === updated.queryId ? updated : current))
  }

  async function sendReply(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const updated = await adminApi.respondToQuery(token, responding.queryId, response)
      refreshDialog(updated)
      setResponse('')
      setNotice({
        kind: 'success',
        text: `Reply saved. It is on its way to ${responding.email} - this panel says “emailed” once it has actually gone.`,
      })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  async function markAnsweredOutside() {
    setBusy(true)
    try {
      const updated = await adminApi.markQueryAnsweredOutside(token, responding.queryId, response)
      refreshDialog(updated)
      setResponse('')
      setNotice({
        kind: 'success',
        text: 'Marked as answered from your inbox. Nothing was sent by the site.',
      })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  /** The one line that says what became of the answer, in the order that matters. */
  function replyState(query) {
    if (query.replySent) return { text: 'Reply emailed', kind: 'sent' }
    if (query.answeredOutside) return { text: 'Answered from your inbox', kind: 'outside' }
    if (query.status === 'RESPONDED') return { text: 'Reply not sent', kind: 'failed' }
    return null
  }

  return (
    <>
      <Toolbar>
        <Segmented options={FILTERS} value={onlyNew} onChange={setOnlyNew} />
        <span className="adm-toolbar__spacer" />
        <span className="adm-table__muted">
          {queries.length} enquir{queries.length === 1 ? 'y' : 'ies'}
        </span>
      </Toolbar>

      {error && <Notice kind="error">{error}</Notice>}
      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div className="adm-card">
        <DataTable
          head={['From', 'Enquiry', 'Received', 'Status', 'Actions']}
          empty={
            queries.length === 0
              ? {
                  title: loading ? 'Loading…' : 'Nothing to answer',
                  hint: onlyNew ? 'Every enquiry has been answered.' : 'The contact form has not been used yet.',
                }
              : null
          }
        >
          {queries.map((query) => {
            const state = replyState(query)
            const messages = query.messages ?? []
            const lastReply = messages.filter((m) => m.direction === 'AGENCY').pop()
            // A customer message after the last answer means the enquiry is back in play, whatever the
            // status says - which is exactly what the waiting list is for.
            const lastAnswerAt = messages.reduce(
              (found, message, index) => (message.direction === 'AGENCY' ? index : found),
              -1
            )
            const wroteAgain = messages.some(
              (message, index) => message.direction === 'CUSTOMER' && index > lastAnswerAt
            )

            return (
              <tr key={query.queryId}>
                <td>
                  <span className="adm-table__strong">{query.name}</span>
                  <div className="adm-table__muted">{query.email}</div>
                  {query.phone && <div className="adm-table__muted">{query.phone}</div>}
                </td>
                <td style={{ maxWidth: 360 }}>
                  <strong>{query.subject}</strong>
                  <div className="adm-table__muted">#{query.queryId}</div>
                  {lastReply?.body && (
                    <div className="adm-table__muted" style={{ marginTop: 6 }}>
                      <strong>Reply:</strong> {lastReply.body}
                    </div>
                  )}
                  {wroteAgain && (
                    <div className="adm-flag adm-flag--attention" style={{ marginTop: 6 }}>
                      They wrote again
                    </div>
                  )}
                </td>
                <td>{formatDate(query.submittedAt) ?? '—'}</td>
                <td>
                  <StatusPill
                    value={query.status}
                    label={query.status === 'NEW' ? 'Waiting' : 'Answered'}
                  />
                  {state && <div className={`adm-reply-state adm-reply-state--${state.kind}`}>{state.text}</div>}
                  {query.respondedByName && (
                    <div className="adm-table__muted">by {query.respondedByName}</div>
                  )}
                </td>
                <td>
                  <div className="adm-table__actions">
                    <button
                      type="button"
                      className={`adm-btn adm-btn--sm ${query.status === 'NEW' ? 'adm-btn--primary' : 'adm-btn--outline'}`}
                      onClick={() => openRespond(query)}
                    >
                      {query.status === 'NEW' ? 'Reply' : 'View'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </DataTable>
      </div>

      <Dialog
        open={Boolean(responding)}
        title={responding ? `Enquiry #${responding.queryId} from ${responding.name}` : ''}
        onClose={() => setResponding(null)}
      >
        {responding && (
          <div className="adm-form">
            <p className="adm-table__muted" style={{ fontSize: '0.88rem', margin: 0 }}>
              {responding.email}
              {responding.phone ? ` · ${responding.phone}` : ''}
            </p>

            {/* Not Field: that wraps its children in a <label>, which belongs around a control rather
                than around a quotation and a list. */}
            <div className="adm-field">
              <span className="adm-field__label">What they asked</span>
              <div className="adm-quote">
                <strong>{responding.subject}</strong>
                <p>{responding.message}</p>
              </div>
            </div>

            {(responding.messages ?? []).length > 0 && (
              <div className="adm-field">
                <span className="adm-field__label">
                  The conversation ({responding.messages.length})
                </span>
                <ol className="adm-thread">
                  {responding.messages.map((entry) => (
                    <li key={entry.messageId} className={`adm-thread__item adm-thread__item--${entry.direction.toLowerCase()}`}>
                      <div className="adm-thread__meta">
                        <strong>{entry.direction === 'AGENCY' ? 'You' : 'They'}</strong>
                        <span>
                          {formatDate(entry.createdAt) ?? ''}
                          {entry.direction === 'AGENCY'
                            ? entry.emailed
                              ? ' · emailed'
                              : ' · written in your inbox'
                            : ' · on the site'}
                        </span>
                      </div>
                      <p className="adm-thread__body">
                        {entry.body ?? 'No copy of this message was kept.'}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <form className="adm-form" onSubmit={sendReply}>
              <Field
                label={responding.status === 'NEW' ? 'Your reply' : 'Add to the conversation'}
                hint={
                  responding.status === 'NEW'
                    ? `Sent to ${responding.email} as soon as you save it, and kept on the enquiry.`
                    : 'They have already been answered. Adding another message sends it straight away.'
                }
              >
                <textarea
                  rows={6}
                  value={response}
                  onChange={(event) => setResponse(event.target.value)}
                  required
                  maxLength={5000}
                />
              </Field>

              <div className="adm-form__actions">
                <button type="button" className="adm-btn adm-btn--outline" onClick={() => setResponding(null)}>
                  Close
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn--outline"
                  onClick={markAnsweredOutside}
                  disabled={busy}
                >
                  I answered from my inbox
                </button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Send reply by email'}
                </button>
              </div>
            </form>

            <p className="adm-table__muted" style={{ fontSize: '0.78rem', margin: 0 }}>
              “I answered from my inbox” records the reply above (if you paste it) and takes the enquiry off
              the waiting list without sending anything. Use it when the answer went out from Gmail, so the
              list still means something.
            </p>
          </div>
        )}
      </Dialog>
    </>
  )
}
