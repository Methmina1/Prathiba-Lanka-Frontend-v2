import { useRef, useState } from 'react'
import { api } from '../../api/client'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { Notice, Segmented, Toolbar } from '../../components/admin/AdminUI'
import { describeError, useAdminList } from '../../components/admin/useAdmin'
import { formatBytes, formatDate } from '../../utils/format'

const FILTERS = [
  { value: null, label: 'All' },
  { value: 'IMAGE', label: 'Images' },
  { value: 'VIDEO', label: 'Videos' },
]

export default function AdminMedia() {
  const { token } = useAuth()
  const [filter, setFilter] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const fileInput = useRef(null)

  const { rows: assets, loading, error, reload } = useAdminList(
    async () => {
      const [media, limits] = await Promise.all([adminApi.listMedia(token, filter), adminApi.mediaLimits(token)])
      return [{ media, limits }]
    },
    [token, filter]
  )

  const media = assets[0]?.media ?? []
  const limits = assets[0]?.limits

  async function upload(event) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    setBusy(true)
    setNotice({ kind: 'info', text: `Uploading ${files.length} file(s)…` })

    let uploaded = 0
    const problems = []
    for (const file of files) {
      try {
        await adminApi.uploadMedia(token, file, file.name.replace(/\.[^.]+$/, ''))
        uploaded += 1
      } catch (problem) {
        problems.push(`${file.name}: ${describeError(problem)}`)
      }
    }

    setBusy(false)
    if (fileInput.current) fileInput.current.value = ''
    if (problems.length === 0) {
      setNotice({ kind: 'success', text: `${uploaded} file(s) uploaded.` })
    } else {
      setNotice({ kind: 'error', text: problems.join(' ') })
    }
    reload()
  }

  async function remove(asset) {
    setBusy(true)
    try {
      await adminApi.deleteMedia(token, asset.mediaId)
      setNotice({ kind: 'success', text: 'File deleted.' })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  const copyUrl = async (asset) => {
    try {
      await navigator.clipboard.writeText(asset.url)
      setNotice({ kind: 'success', text: `Copied ${asset.url} - paste it into a gallery item or a journal cover.` })
    } catch {
      setNotice({ kind: 'info', text: `Path: ${asset.url}` })
    }
  }

  return (
    <>
      <Toolbar>
        <button
          type="button"
          className="adm-btn adm-btn--primary"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          {busy ? 'Working…' : 'Upload files'}
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,video/quicktime"
          onChange={upload}
          style={{ display: 'none' }}
        />
        <Segmented options={FILTERS} value={filter} onChange={setFilter} />
        <span className="adm-toolbar__spacer" />
        <span className="adm-table__muted">
          {media.length} file{media.length === 1 ? '' : 's'}
          {limits
            ? ` · images to ${formatBytes(limits.maxImageBytes)}, videos to ${formatBytes(limits.maxVideoBytes)}`
            : ''}
        </span>
      </Toolbar>

      {error && <Notice kind="error">{error}</Notice>}
      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      {media.length === 0 ? (
        <div className="adm-card adm-empty">
          <strong>{loading ? 'Loading…' : 'No files yet'}</strong>
          <span>
            Upload images (JPEG, PNG, WebP, GIF, AVIF) and short videos (MP4, WebM, MOV). They are
            stored by the backend and served from /media, ready for the gallery, journal covers and
            page images.
          </span>
        </div>
      ) : (
        <div className="adm-media-grid adm-media-grid--page">
          {media.map((asset) => (
            <div className="adm-media-card" key={asset.mediaId}>
              <div className="adm-media-card__thumb">
                {asset.mediaType === 'VIDEO' ? (
                  <video src={api.mediaUrl(asset.url)} controls muted preload="metadata" />
                ) : (
                  <img
                    src={api.mediaUrl(asset.url)}
                    alt={asset.title ?? asset.originalName}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="adm-media-card__body">
                <strong>{asset.title ?? asset.originalName}</strong>
                <span className="adm-table__muted">
                  {asset.mediaType === 'VIDEO' ? 'Video' : 'Image'} · {formatBytes(asset.sizeBytes)} ·{' '}
                  {formatDate(asset.uploadedAt)}
                </span>
                <code className="adm-media-card__url">{asset.url}</code>
                <div className="adm-table__actions">
                  <button
                    type="button"
                    className="adm-btn adm-btn--sm adm-btn--outline"
                    onClick={() => copyUrl(asset)}
                  >
                    Copy path
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => setConfirmDelete(asset)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="adm-dialog-backdrop" role="dialog" aria-modal="true" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setConfirmDelete(null)
        }}>
          <div className="adm-dialog">
            <div className="adm-dialog__head">
              <h2>Delete file</h2>
            </div>
            <div className="adm-dialog__body">
              <p style={{ marginBottom: '1rem', color: 'var(--adm-muted)' }}>
                Delete &quot;{confirmDelete.title ?? confirmDelete.originalName}&quot;? Files still used by
                the gallery or a journal cover are refused, so a page cannot be left pointing at a
                missing file.
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}
