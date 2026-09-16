import { useState } from 'react'
import { api } from '../../api/client'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { Dialog, Field, Notice, Toolbar } from '../../components/admin/AdminUI'
import { describeError, useAdminList } from '../../components/admin/useAdmin'
import { formatDate } from '../../utils/format'

const EMPTY_FORM = { imageUrl: '', caption: '', packageId: '' }

export default function AdminGallery() {
  const { token } = useAuth()

  const { rows: images, loading, error, reload } = useAdminList(async () => {
    const [gallery, packages] = await Promise.all([api.getGallery(), adminApi.listPackages(token)])
    return [{ gallery, packages }]
  }, [token])

  const gallery = images[0]?.gallery ?? []
  const packages = images[0]?.packages ?? []

  const [dialog, setDialog] = useState(null)
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
    }

    try {
      if (mode === 'create') await adminApi.uploadImage(token, payload)
      else await adminApi.updateImage(token, id, payload)
      setDialog(null)
      setNotice({ kind: 'success', text: mode === 'create' ? 'Image added to the gallery.' : 'Image updated.' })
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
      setNotice({ kind: 'success', text: 'Image removed.' })
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
          Add image
        </button>
        <span className="adm-toolbar__spacer" />
        <span className="adm-table__muted">
          {gallery.length} image{gallery.length === 1 ? '' : 's'}
        </span>
      </Toolbar>

      {error && <Notice kind="error">{error}</Notice>}
      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      {gallery.length === 0 ? (
        <div className="adm-card adm-empty">
          <strong>{loading ? 'Loading…' : 'The gallery is empty'}</strong>
          <span>
            Add an image URL and it appears on the public gallery straight away. The website shows
            illustrated placeholders until then.
          </span>
        </div>
      ) : (
        <div className="adm-gallery">
          {gallery.map((image) => (
            <div className="adm-gallery__item" key={image.imageId}>
              <div className="adm-gallery__thumb">
                <img src={image.imageUrl} alt={image.caption ?? 'Gallery image'} loading="lazy" />
              </div>
              <div className="adm-gallery__body">
                <strong>{image.caption ?? 'Untitled'}</strong>
                <p>
                  {image.packageTitle ?? 'Not linked to a package'}
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

      <Dialog open={Boolean(dialog)} title={dialog?.mode === 'create' ? 'Add image' : 'Edit image'} onClose={() => setDialog(null)}>
        {dialog && (
          <form className="adm-form" onSubmit={submit}>
            <Field label="Image URL" hint="A hosted image - the backend stores the URL, not the file.">
              <input value={dialog.form.imageUrl} onChange={patch('imageUrl')} required maxLength={255} />
            </Field>

            <Field label="Caption">
              <input value={dialog.form.caption} onChange={patch('caption')} maxLength={255} />
            </Field>

            <Field label="Link to a package" hint="Optional - the image then appears on that journey's page too.">
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
                {busy ? 'Saving…' : dialog.mode === 'create' ? 'Add image' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={Boolean(confirmDelete)} title="Remove image" onClose={() => setConfirmDelete(null)}>
        <p style={{ marginBottom: '1rem', color: 'var(--adm-muted)' }}>
          Remove this image from the gallery? The file itself is not touched.
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
