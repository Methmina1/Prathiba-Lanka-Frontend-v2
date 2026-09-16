import { useState } from 'react'
import { api } from '../../api/client'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { Dialog, Field, Notice, Toolbar } from '../../components/admin/AdminUI'
import MediaPicker from '../../components/admin/MediaPicker'
import { describeError, useAdminList } from '../../components/admin/useAdmin'
import { formatDate } from '../../utils/format'

const EMPTY_FORM = { imageUrl: '', caption: '', packageId: '', mediaType: 'IMAGE' }

export default function AdminGallery() {
  const { token } = useAuth()

  const { rows: images, loading, error, reload } = useAdminList(async () => {
    const [gallery, packages] = await Promise.all([api.getGallery(), adminApi.listPackages(token)])
    return [{ gallery, packages }]
  }, [token])

  const gallery = images[0]?.gallery ?? []
  const packages = images[0]?.packages ?? []

  const [dialog, setDialog] = useState(null)
  const [picker, setPicker] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  function openUpload() {
    setDialog({ mode: 'create', form: EMPTY_FORM })
  }

  function openEdit(image) {
    setDialog({
      mode: 'edit',
      id: image.imageId,
      form: {
        imageUrl: image.imageUrl ?? '',
        caption: image.caption ?? '',
        packageId: image.packageId ?? '',
        mediaType: image.mediaType ?? 'IMAGE',
      },
    })
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    const { mode, id, form } = dialog
    const payload = {
      imageUrl: form.imageUrl,
      caption: form.caption || null,
      packageId: form.packageId === '' ? null : Number(form.packageId),
      mediaType: form.mediaType,
    }

    try {
      if (mode === 'create') await adminApi.uploadImage(token, payload)
      else await adminApi.updateImage(token, id, payload)
      setDialog(null)
      setNotice({
        kind: 'success',
        text: mode === 'create' ? 'Added to the gallery.' : 'Gallery item updated.',
      })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  async function remove(image) {
    setBusy(true)
    try {
      await adminApi.deleteImage(token, image.imageId)
      setNotice({ kind: 'success', text: 'Removed from the gallery.' })
      reload()
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  const patch = (field) => (event) =>
    setDialog((current) => ({ ...current, form: { ...current.form, [field]: event.target.value } }))

  return (
    <>
      <Toolbar>
        <button type="button" className="adm-btn adm-btn--primary" onClick={openUpload}>
          Add image or video
        </button>
        <span className="adm-toolbar__spacer" />
        <span className="adm-table__muted">
          {gallery.length} item{gallery.length === 1 ? '' : 's'} ·{' '}
          {gallery.filter((item) => item.mediaType === 'VIDEO').length} video(s)
        </span>
      </Toolbar>

      {error && <Notice kind="error">{error}</Notice>}
      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      {gallery.length === 0 ? (
        <div className="adm-card adm-empty">
          <strong>{loading ? 'Loading…' : 'The gallery is empty'}</strong>
          <span>
            Upload an image or a short video in the media library, then add it here. The website shows
            illustrated placeholders until then.
          </span>
        </div>
      ) : (
        <div className="adm-gallery">
          {gallery.map((image) => (
            <div className="adm-gallery__item" key={image.imageId}>
              <div className="adm-gallery__thumb">
                {image.mediaType === 'VIDEO' ? (
                  <video src={api.mediaUrl(image.imageUrl)} muted preload="metadata" />
                ) : (
                  <img src={api.mediaUrl(image.imageUrl)} alt={image.caption ?? 'Gallery image'} loading="lazy" />
                )}
              </div>
              <div className="adm-gallery__body">
                <strong>{image.caption ?? 'Untitled'}</strong>
                <p>
                  {image.mediaType === 'VIDEO' ? 'Video' : 'Image'} ·{' '}
                  {image.packageTitle ?? 'not linked to a package'}
                  {image.uploadedAt ? ` · added ${formatDate(image.uploadedAt)}` : ''}
                </p>
                <div className="adm-gallery__actions">
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => openEdit(image)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => setConfirmDelete(image)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(dialog)}
        title={dialog?.mode === 'create' ? 'Add to the gallery' : 'Edit gallery item'}
        onClose={() => setDialog(null)}
      >
        {dialog && (
          <form className="adm-form" onSubmit={submit}>
            <Field label="Media type">
              <select value={dialog.form.mediaType} onChange={patch('mediaType')}>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video (short clip)</option>
              </select>
            </Field>

            <Field
              label={dialog.form.mediaType === 'VIDEO' ? 'Video' : 'Image'}
              hint="Choose an uploaded file, or paste any hosted URL."
            >
              <div className="adm-inline">
                <input value={dialog.form.imageUrl} onChange={patch('imageUrl')} required maxLength={255} />
                <button type="button" className="adm-btn adm-btn--outline" onClick={() => setPicker(true)}>
                  Library
                </button>
              </div>
            </Field>

            <Field label="Caption">
              <input value={dialog.form.caption} onChange={patch('caption')} maxLength={255} />
            </Field>

            <Field label="Link to a package" hint="Optional - the item then appears on that journey's page too.">
              <select value={dialog.form.packageId} onChange={patch('packageId')}>
                <option value="">No package</option>
                {packages.map((pkg) => (
                  <option key={pkg.packageId} value={pkg.packageId}>
                    {pkg.title}
                  </option>
                ))}
              </select>
            </Field>

            <div className="adm-form__actions">
              <button type="button" className="adm-btn adm-btn--outline" onClick={() => setDialog(null)}>
                Cancel
              </button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
                {busy ? 'Saving…' : dialog.mode === 'create' ? 'Add to gallery' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(asset) =>
          setDialog((current) => ({
            ...current,
            form: { ...current.form, imageUrl: asset.url, mediaType: asset.mediaType },
          }))
        }
      />

      <Dialog open={Boolean(confirmDelete)} title="Remove from the gallery" onClose={() => setConfirmDelete(null)}>
        <p style={{ marginBottom: '1rem', color: 'var(--adm-muted)' }}>
          Remove this item from the gallery? The uploaded file stays in the media library.
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
            Remove
          </button>
        </div>
      </Dialog>
    </>
  )
}
