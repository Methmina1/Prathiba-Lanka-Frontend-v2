import { useRef, useState } from 'react'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { Dialog, Notice, Segmented } from './AdminUI'
import { describeError, useAdminList } from './useAdmin'
import { formatBytes } from '../../utils/format'

const FILTERS = [
  { value: null, label: 'All' },
  { value: 'IMAGE', label: 'Images' },
  { value: 'VIDEO', label: 'Videos' },
]

/**
 * Picks a file that the backend already stores: upload one, or choose an existing asset. Used
 * wherever the console needs a URL (gallery items, journal covers).
 */
export default function MediaPicker({ open, onClose, onPick, initialType = null }) {
  const { token } = useAuth()
  const [filter, setFilter] = useState(initialType)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef(null)

  const { rows, loading, reload } = useAdminList(() => adminApi.listMedia(token, filter), [token, filter])

  async function upload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const asset = await adminApi.uploadMedia(token, file, file.name)
      reload()
      onPick(asset)
      onClose()
    } catch (problem) {
      setError(describeError(problem))
    } finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <Dialog open={open} title="Media library" onClose={onClose} wide>
      <div className="adm-toolbar" style={{ marginBottom: '0.9rem' }}>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} />
        <span className="adm-toolbar__spacer" />
        <button
          type="button"
          className="adm-btn adm-btn--primary adm-btn--sm"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          {busy ? 'Uploading…' : 'Upload a file'}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          onChange={upload}
          style={{ display: 'none' }}
        />
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      {rows.length === 0 ? (
        <div className="adm-empty">
          <strong>{loading ? 'Loading…' : 'Nothing uploaded yet'}</strong>
          <span>Upload an image or a short video and it becomes available here.</span>
        </div>
      ) : (
        <div className="adm-media-grid">
          {rows.map((asset) => (
            <button
              key={asset.mediaId}
              type="button"
              className="adm-media"
              onClick={() => {
                onPick(asset)
                onClose()
              }}
            >
              <span className="adm-media__thumb">
                {asset.mediaType === 'VIDEO' ? (
                  <video src={asset.url} muted preload="metadata" />
                ) : (
                  <img src={asset.url} alt={asset.title ?? ''} loading="lazy" />
                )}
                {asset.mediaType === 'VIDEO' && <span className="adm-media__badge">Video</span>}
              </span>
              <strong title={asset.originalName}>{asset.title ?? asset.originalName}</strong>
              <span className="adm-table__muted">{formatBytes(asset.sizeBytes)}</span>
            </button>
          ))}
        </div>
      )}
    </Dialog>
  )
}
