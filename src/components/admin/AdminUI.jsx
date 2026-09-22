import { useEffect } from 'react'
import { Close } from '../ui/Icons'

/**
 * Status chip shared by every admin table.
 *
 * `label` exists because the stored status and the word the agency uses are not always the same:
 * a booking the console cancels is stored as REJECTED (the value the API has always returned), and
 * showing "REJECTED" beside a button that says Cancel reads like two different things happened.
 */
export function StatusPill({ value, label }) {
  if (!value) return null
  return <span className={`adm-pill adm-pill--${String(value).toLowerCase()}`}>{label ?? value}</span>
}

export function Notice({ kind = 'info', children }) {
  if (!children) return null
  const modifier = kind === 'info' ? '' : ` adm-notice--${kind}`
  return <div className={`adm-notice${modifier}`}>{children}</div>
}

export function DataTable({ head, children, empty }) {
  if (empty) {
    return (
      <div className="adm-empty">
        <strong>{empty.title}</strong>
        {empty.hint && <span>{empty.hint}</span>}
      </div>
    )
  }

  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            {head.map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Dialog({ open, title, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="adm-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={`adm-dialog ${wide ? 'adm-dialog--wide' : ''}`}>
        <div className="adm-dialog__head">
          <h2>{title}</h2>
          <button type="button" className="adm-dialog__close" onClick={onClose} aria-label="Close">
            <Close width={18} height={18} />
          </button>
        </div>
        <div className="adm-dialog__body">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      {children}
      {hint && <span className="adm-field__hint">{hint}</span>}
    </label>
  )
}

export function Toolbar({ children }) {
  return <div className="adm-toolbar">{children}</div>
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="adm-segmented">
      {options.map((option) => (
        <button
          key={option.value || 'all'}
          type="button"
          className={value === option.value ? 'is-active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
