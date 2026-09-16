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
    setResponse(query.adminResponse ?? '')
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await adminApi.respondToQuery(token, responding.queryId, response)
      setResponding(null)
      setNotice({ kind: 'success', text: 'Response saved against the enquiry.' })
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
          head={['From', 'Subject', 'Message', 'Received', 'Status', 'Actions']}
          empty={
            queries.length === 0
              ? {
                  title: loading ? 'Loading…' : 'Nothing to answer',
                  hint: onlyNew ? 'Every enquiry has been answered.' : 'The contact form has not been used yet.',
                }
              : null
          }
        >
          {queries.map((query) => (
            <tr key={query.queryId}>
              <td>
                <span className="adm-table__strong">{query.name}</span>
                <div className="adm-table__muted">{query.email}</div>
                {query.phone && <div className="adm-table__muted">{query.phone}</div>}
              </td>
              <td>{query.subject}</td>
              <td style={{ maxWidth: 340 }}>
                {query.message}
                {query.adminResponse && (
                  <div className="adm-table__muted" style={{ marginTop: 6 }}>
                    <strong>Reply:</strong> {query.adminResponse}
                  </div>
                )}
              </td>
              <td>{formatDate(query.submittedAt) ?? '—'}</td>
              <td>
                <StatusPill value={query.status} />
                {query.respondedByName && <div className="adm-table__muted">by {query.respondedByName}</div>}
              </td>
              <td>
                <div className="adm-table__actions">
                  {query.status === 'NEW' ? (
                    <button type="button" className="adm-btn adm-btn--sm adm-btn--primary" onClick={() => openRespond(query)}>
                      Reply
                    </button>
                  ) : (
                    <button type="button" className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => openRespond(query)}>
                      View
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <Dialog open={Boolean(responding)} title={`Reply to ${responding?.name ?? ''}`} onClose={() => setResponding(null)}>
        {responding && (
          <form className="adm-form" onSubmit={submit}>
            <p style={{ color: 'var(--adm-muted)', fontSize: '0.88rem' }}>
              <strong>{responding.subject}</strong>
              <br />
              {responding.message}
            </p>

            <Field
              label="Your response"
              hint={
                responding.status === 'RESPONDED'
                  ? 'Already answered - the reply is stored on the enquiry for the record.'
                  : 'Saved against the enquiry; the customer sees it in the admin follow-up list.'
              }
            >
              <textarea
                rows={6}
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                required
                disabled={responding.status === 'RESPONDED'}
              />
            </Field>

            <div className="adm-form__actions">
              <button type="button" className="adm-btn adm-btn--outline" onClick={() => setResponding(null)}>
                Close
              </button>
              {responding.status === 'NEW' && (
                <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save response'}
                </button>
              )}
            </div>
          </form>
        )}
      </Dialog>
    </>
  )
}
