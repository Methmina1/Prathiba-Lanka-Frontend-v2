import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { DataTable, Dialog, Field, Notice, StatusPill, Toolbar } from '../../components/admin/AdminUI'
import MediaPicker from '../../components/admin/MediaPicker'
import { describeError, useAdminList } from '../../components/admin/useAdmin'
import { formatDate } from '../../utils/format'

const EMPTY_FORM = { title: '', description: '', content: '', coverImageUrl: '', status: 'DRAFT' }

export default function AdminJournal() {
  const { token } = useAuth()
  const { rows: posts, loading, error, reload } = useAdminList(() => adminApi.listJournal(token), [token])

  const [dialog, setDialog] = useState(null)
  const [picker, setPicker] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  function openCreate() {
    setDialog({ mode: 'create', form: EMPTY_FORM })
  }

  function openEdit(post) {
    setDialog({
      mode: 'edit',
      id: post.journalId,
      form: {
        title: post.title ?? '',
        description: post.description ?? '',
        content: post.content ?? '',
        coverImageUrl: post.coverImageUrl ?? '',
        status: post.status ?? 'DRAFT',
      },
    })
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    const { mode, id, form } = dialog
    const payload = {
      title: form.title,
      description: form.description || null,
      content: form.content,
      coverImageUrl: form.coverImageUrl || null,
      status: form.status,
    }

    try {
      if (mode === 'create') await adminApi.createPost(token, payload)
      else await adminApi.updatePost(token, id, payload)
      setDialog(null)
      setNotice({ kind: 'success', text: mode === 'create' ? 'Story created.' : 'Story updated.' })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  async function run(action, success) {
    setBusy(true)
    try {
      await action()
      setNotice({ kind: 'success', text: success })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  const patch = (field) => (event) =>
    setDialog((current) => ({ ...current, form: { ...current.form, [field]: event.target.value } }))

  const published = posts.filter((post) => post.status === 'PUBLISHED').length

  return (
    <>
      <Toolbar>
        <button type="button" className="adm-btn adm-btn--primary" onClick={openCreate}>
          New story
        </button>
        <span className="adm-toolbar__spacer" />
        <span className="adm-table__muted">
          {posts.length} post{posts.length === 1 ? '' : 's'} · {published} published
        </span>
      </Toolbar>

      {error && <Notice kind="error">{error}</Notice>}
      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div className="adm-card">
        <DataTable
          head={['Title', 'Status', 'Published', 'Updated', 'Actions']}
          empty={
            posts.length === 0
              ? {
                  title: loading ? 'Loading…' : 'No stories yet',
                  hint: 'Drafts stay off the public journal until you publish them.',
                }
              : null
          }
        >
          {posts.map((post) => (
            <tr key={post.journalId}>
              <td className="adm-table__strong">
                {post.status === 'PUBLISHED' ? (
                  <Link to={`/journal/${post.journalId}`}>{post.title}</Link>
                ) : (
                  post.title
                )}
                {post.description && <div className="adm-table__muted">{post.description}</div>}
              </td>
              <td>
                <StatusPill value={post.status} />
              </td>
              <td>{formatDate(post.publishedAt) ?? '—'}</td>
              <td>{formatDate(post.updatedAt) ?? '—'}</td>
              <td>
                <div className="adm-table__actions">
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => openEdit(post)}>
                    Edit
                  </button>
                  {post.status === 'PUBLISHED' ? (
                    <button
                      type="button"
                      className="adm-btn adm-btn--sm adm-btn--outline"
                      disabled={busy}
                      onClick={() => run(() => adminApi.unpublishPost(token, post.journalId), 'Story unpublished.')}
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="adm-btn adm-btn--sm adm-btn--primary"
                      disabled={busy}
                      onClick={() => run(() => adminApi.publishPost(token, post.journalId), 'Story published.')}
                    >
                      Publish
                    </button>
                  )}
                  <button
                    type="button"
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => setConfirmDelete(post)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <Dialog
        open={Boolean(dialog)}
        title={dialog?.mode === 'create' ? 'New story' : 'Edit story'}
        onClose={() => setDialog(null)}
        wide
      >
        {dialog && (
          <form className="adm-form" onSubmit={submit}>
            <Field label="Title">
              <input value={dialog.form.title} onChange={patch('title')} required maxLength={255} />
            </Field>

            <Field label="Summary" hint="One or two lines, shown on the journal cards.">
              <textarea rows={2} value={dialog.form.description} onChange={patch('description')} />
            </Field>

            <Field label="Cover image" hint="Optional - an illustration is used when this is empty.">
              <div className="adm-inline">
                <input value={dialog.form.coverImageUrl} onChange={patch('coverImageUrl')} maxLength={255} />
                <button type="button" className="adm-btn adm-btn--outline" onClick={() => setPicker(true)}>
                  Library
                </button>
              </div>
            </Field>

            <Field label="Story" hint="Blank lines separate paragraphs.">
              <textarea rows={12} value={dialog.form.content} onChange={patch('content')} required />
            </Field>

            <Field label="Status">
              <select value={dialog.form.status} onChange={patch('status')}>
                <option value="DRAFT">DRAFT - not visible</option>
                <option value="PUBLISHED">PUBLISHED - live on the site</option>
              </select>
            </Field>

            <div className="adm-form__actions">
              <button type="button" className="adm-btn adm-btn--outline" onClick={() => setDialog(null)}>
                Cancel
              </button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
                {busy ? 'Saving…' : dialog.mode === 'create' ? 'Create story' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(asset) =>
          setDialog((current) => ({ ...current, form: { ...current.form, coverImageUrl: asset.url } }))
        }
      />

      <Dialog open={Boolean(confirmDelete)} title="Delete story" onClose={() => setConfirmDelete(null)}>
        <p style={{ marginBottom: '1rem', color: 'var(--adm-muted)' }}>
          Delete <strong>{confirmDelete?.title}</strong>? This cannot be undone.
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
              run(() => adminApi.deletePost(token, target.journalId), 'Story deleted.')
            }}
          >
            Delete
          </button>
        </div>
      </Dialog>
    </>
  )
}
