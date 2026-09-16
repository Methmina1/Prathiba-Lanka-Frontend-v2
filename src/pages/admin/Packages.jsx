import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { DataTable, Dialog, Field, Notice, StatusPill, Toolbar } from '../../components/admin/AdminUI'
import { describeError, useAdminList } from '../../components/admin/useAdmin'
import { formatDays, formatPrice } from '../../utils/format'

const EMPTY_FORM = {
  title: '',
  destination: '',
  durationDays: '',
  price: '',
  maxCapacity: '',
  status: 'ACTIVE',
  description: '',
  itinerary: '',
}

export default function AdminPackages() {
  const { token } = useAuth()
  const { rows: packages, loading, error, reload } = useAdminList(() => adminApi.listPackages(token), [token])

  const [dialog, setDialog] = useState(null) // { mode, form }
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  function openCreate() {
    setDialog({ mode: 'create', form: EMPTY_FORM })
  }

  function openEdit(pkg) {
    setDialog({
      mode: 'edit',
      id: pkg.packageId,
      form: {
        title: pkg.title ?? '',
        destination: pkg.destination ?? '',
        durationDays: pkg.durationDays ?? '',
        price: pkg.price ?? '',
        maxCapacity: pkg.maxCapacity ?? '',
        status: pkg.status ?? 'ACTIVE',
        description: pkg.description ?? '',
        itinerary: pkg.itinerary ?? '',
      },
    })
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    const { mode, id, form } = dialog
    const payload = {
      title: form.title,
      destination: form.destination,
      durationDays: Number(form.durationDays),
      price: Number(form.price),
      maxCapacity: form.maxCapacity === '' ? null : Number(form.maxCapacity),
      status: form.status,
      description: form.description || null,
      itinerary: form.itinerary || null,
    }

    try {
      if (mode === 'create') await adminApi.createPackage(token, payload)
      else await adminApi.updatePackage(token, id, payload)
      setDialog(null)
      setNotice({ kind: 'success', text: mode === 'create' ? 'Package created.' : 'Package updated.' })
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

  return (
    <>
      <Toolbar>
        <button type="button" className="adm-btn adm-btn--primary" onClick={openCreate}>
          New package
        </button>
        <span className="adm-toolbar__spacer" />
        <span className="adm-table__muted">
          {packages.length} package{packages.length === 1 ? '' : 's'}
        </span>
      </Toolbar>

      {error && <Notice kind="error">{error}</Notice>}
      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div className="adm-card">
        <DataTable
          head={['Title', 'Destination', 'Duration', 'Price', 'Capacity', 'Status', 'Actions']}
          empty={
            packages.length === 0
              ? {
                  title: loading ? 'Loading…' : 'No packages yet',
                  hint: 'Create the first journey and it appears on the public site immediately.',
                }
              : null
          }
        >
          {packages.map((pkg) => (
            <tr key={pkg.packageId}>
              <td className="adm-table__strong">
                <Link to={`/journeys/${pkg.packageId}`}>{pkg.title}</Link>
              </td>
              <td>{pkg.destination ?? '—'}</td>
              <td>{formatDays(pkg.durationDays) ?? '—'}</td>
              <td>{formatPrice(pkg.price) ?? '—'}</td>
              <td>{pkg.maxCapacity ?? '—'}</td>
              <td>
                <StatusPill value={pkg.status} />
              </td>
              <td>
                <div className="adm-table__actions">
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => openEdit(pkg)}>
                    Edit
                  </button>
                  {pkg.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      className="adm-btn adm-btn--sm adm-btn--outline"
                      disabled={busy}
                      onClick={() => run(() => adminApi.deactivatePackage(token, pkg.packageId), 'Package deactivated.')}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="adm-btn adm-btn--sm adm-btn--outline"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () =>
                            adminApi.updatePackage(token, pkg.packageId, {
                              title: pkg.title,
                              destination: pkg.destination,
                              durationDays: pkg.durationDays,
                              price: pkg.price,
                              maxCapacity: pkg.maxCapacity,
                              description: pkg.description,
                              itinerary: pkg.itinerary,
                              status: 'ACTIVE',
                            }),
                          'Package activated.'
                        )
                      }
                    >
                      Activate
                    </button>
                  )}
                  <button
                    type="button"
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => setConfirmDelete(pkg)}
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
        title={dialog?.mode === 'create' ? 'New package' : 'Edit package'}
        onClose={() => setDialog(null)}
        wide
      >
        {dialog && (
          <form className="adm-form" onSubmit={submit}>
            <div className="adm-grid-2">
              <Field label="Title">
                <input value={dialog.form.title} onChange={patch('title')} required maxLength={150} />
              </Field>
              <Field label="Destination">
                <input value={dialog.form.destination} onChange={patch('destination')} required maxLength={150} />
              </Field>
              <Field label="Duration (days)">
                <input type="number" min={1} value={dialog.form.durationDays} onChange={patch('durationDays')} required />
              </Field>
              <Field label="Price per person (USD)">
                <input type="number" min={0} step="0.01" value={dialog.form.price} onChange={patch('price')} required />
              </Field>
              <Field label="Max capacity" hint="Leave empty for no limit.">
                <input type="number" min={1} value={dialog.form.maxCapacity} onChange={patch('maxCapacity')} />
              </Field>
              <Field label="Status">
                <select value={dialog.form.status} onChange={patch('status')}>
                  <option value="ACTIVE">ACTIVE - bookable</option>
                  <option value="INACTIVE">INACTIVE - hidden</option>
                </select>
              </Field>
            </div>

            <Field label="Short description" hint="Shown on the package card.">
              <textarea rows={3} value={dialog.form.description} onChange={patch('description')} />
            </Field>

            <Field label="Itinerary" hint="One line per day - each line becomes a numbered step.">
              <textarea rows={6} value={dialog.form.itinerary} onChange={patch('itinerary')} />
            </Field>

            <div className="adm-form__actions">
              <button type="button" className="adm-btn adm-btn--outline" onClick={() => setDialog(null)}>
                Cancel
              </button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
                {busy ? 'Saving…' : dialog.mode === 'create' ? 'Create package' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={Boolean(confirmDelete)} title="Delete package" onClose={() => setConfirmDelete(null)}>
        <p style={{ marginBottom: '1rem', color: 'var(--adm-muted)' }}>
          Delete <strong>{confirmDelete?.title}</strong>? Packages that already have bookings cannot be
          deleted - deactivate them instead.
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
              run(() => adminApi.deletePackage(token, target.packageId), 'Package deleted.')
            }}
          >
            Delete
          </button>
        </div>
      </Dialog>
    </>
  )
}
