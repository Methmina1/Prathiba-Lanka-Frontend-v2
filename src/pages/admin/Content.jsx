import { useEffect, useState } from 'react'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../auth/AuthContext'
import { Notice, Segmented, Toolbar } from '../../components/admin/AdminUI'
import { describeError } from '../../components/admin/useAdmin'
import { ABOUT_DEFAULTS, CONTACT_DEFAULTS, mergeDefaults } from '../../data/pageContent'
import { formatDate } from '../../utils/format'

const TABS = [
  { value: 'ABOUT', label: 'About page' },
  { value: 'CONTACT', label: 'Contact page' },
]

const SCENERY = ['train', 'tea', 'coast', 'temple', 'safari', 'hills', 'galle', 'ella']
const ICONS = ['phone', 'mail', 'map', 'clock']

/** A labelled text input bound to a path inside the payload, e.g. "hero.title". */
function TextField({ label, value, onChange, hint, textarea = false, maxLength = 400 }) {
  const Control = textarea ? 'textarea' : 'input'
  return (
    <label className="adm-field">
      <span>{label}</span>
      <Control
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        rows={textarea ? 3 : undefined}
        maxLength={maxLength}
      />
      {hint && <span className="adm-field__hint">{hint}</span>}
    </label>
  )
}

/** Adds, removes and reorders the repeating blocks (values, milestones, contact cards). */
function ListEditor({ title, items, onChange, blank, render, max = 12 }) {
  const update = (index, patch) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    onChange(next)
  }

  const move = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="adm-card">
      <div className="adm-card__head">
        <h2>{title}</h2>
        <span className="adm-table__muted">{items.length} of {max}</span>
      </div>
      <div className="adm-card__body adm-stack">
        {items.map((item, index) => (
          <div className="adm-repeat" key={index}>
            <div className="adm-repeat__head">
              <strong>#{index + 1}</strong>
              <div className="adm-table__actions">
                <button type="button" className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => move(index, -1)}>
                  ↑
                </button>
                <button type="button" className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => move(index, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="adm-grid-2">{render(item, (patch) => update(index, patch), index)}</div>
          </div>
        ))}
        <div>
          <button
            type="button"
            className="adm-btn adm-btn--outline adm-btn--sm"
            disabled={items.length >= max}
            onClick={() => onChange([...items, { ...blank }])}
          >
            Add entry
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminContent() {
  const { token } = useAuth()
  const [tab, setTab] = useState('ABOUT')
  const [payload, setPayload] = useState(null)
  const [meta, setMeta] = useState({ updatedAt: null, updatedByName: null })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })

  useEffect(() => {
    let active = true
    setLoading(true)
    adminApi
      .listContent(token)
      .then((sections) => {
        if (!active) return
        const found = sections.find((entry) => entry.section === tab)
        const defaults = tab === 'ABOUT' ? ABOUT_DEFAULTS : CONTACT_DEFAULTS
        setPayload(mergeDefaults(defaults, found?.payload))
        setMeta({ updatedAt: found?.updatedAt ?? null, updatedByName: found?.updatedByName ?? null })
      })
      .catch((problem) => {
        if (active) setNotice({ kind: 'error', text: describeError(problem) })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token, tab])

  const patch = (path, value) => {
    setPayload((current) => {
      const next = structuredClone(current)
      const keys = path.split('.')
      let node = next
      for (const key of keys.slice(0, -1)) node = node[key]
      node[keys[keys.length - 1]] = value
      return next
    })
  }

  async function save() {
    setBusy(true)
    try {
      const saved = await adminApi.saveContent(token, tab, payload)
      setMeta({ updatedAt: saved.updatedAt, updatedByName: saved.updatedByName })
      setNotice({ kind: 'success', text: `${tab === 'ABOUT' ? 'About' : 'Contact'} page saved.` })
    } catch (problem) {
      setNotice({ kind: 'error', text: describeError(problem) })
    } finally {
      setBusy(false)
    }
  }

  // The tabs stay mounted while the payload loads, so the screen never blanks out.
  if (!payload) {
    return (
      <>
        <Toolbar>
          <Segmented options={TABS} value={tab} onChange={setTab} />
          <span className="adm-toolbar__spacer" />
          <span className="adm-table__muted">{loading ? 'Loading…' : 'Nothing stored yet'}</span>
        </Toolbar>
        {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}
        <div className="adm-card adm-empty">
          <strong>Loading the stored content…</strong>
          <span>The page copy is read from the API; the defaults show if it cannot be reached.</span>
        </div>
      </>
    )
  }

  return (
    <>
      <Toolbar>
        <Segmented options={TABS} value={tab} onChange={setTab} />
        <span className="adm-toolbar__spacer" />
        <span className="adm-table__muted">
          {meta.updatedAt
            ? `Last saved ${formatDate(meta.updatedAt)}${meta.updatedByName ? ` by ${meta.updatedByName}` : ''}`
            : 'Never saved - showing the defaults'}
        </span>
        <button type="button" className="adm-btn adm-btn--primary" disabled={busy} onClick={save}>
          {busy ? 'Saving…' : 'Save page'}
        </button>
      </Toolbar>

      {notice.text && <Notice kind={notice.kind}>{notice.text}</Notice>}

      <div className="adm-card">
        <div className="adm-card__head">
          <h2>Page header</h2>
        </div>
        <div className="adm-card__body adm-grid-2">
          <TextField label="Eyebrow" value={payload.hero.eyebrow} onChange={(v) => patch('hero.eyebrow', v)} />
          <TextField label="Title" value={payload.hero.title} onChange={(v) => patch('hero.title', v)} />
          <TextField label="Intro line" value={payload.hero.lede} onChange={(v) => patch('hero.lede', v)} textarea />
          <label className="adm-field">
            <span>Header illustration</span>
            <select value={payload.hero.scenery} onChange={(event) => patch('hero.scenery', event.target.value)}>
              {SCENERY.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <span className="adm-field__hint">Drawn by the site, not an upload.</span>
          </label>
        </div>
      </div>

      {tab === 'ABOUT' ? (
        <>
          <div className="adm-card">
            <div className="adm-card__head">
              <h2>Our story</h2>
            </div>
            <div className="adm-card__body adm-grid-2">
              <TextField label="Eyebrow" value={payload.story.eyebrow} onChange={(v) => patch('story.eyebrow', v)} />
              <TextField label="Heading" value={payload.story.heading} onChange={(v) => patch('story.heading', v)} />
              <TextField label="Paragraph" value={payload.story.lede} onChange={(v) => patch('story.lede', v)} textarea />
              <TextField
                label="Badge title"
                value={payload.story.badgeTitle}
                onChange={(v) => patch('story.badgeTitle', v)}
                hint="Shown on the framed illustration."
              />
              <TextField label="Badge line" value={payload.story.badgeText} onChange={(v) => patch('story.badgeText', v)} />
              <label className="adm-field">
                <span>Illustration</span>
                <select value={payload.story.scenery} onChange={(event) => patch('story.scenery', event.target.value)}>
                  {SCENERY.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <ListEditor
            title="Story highlights"
            items={payload.story.points ?? []}
            blank={{ title: '', text: '' }}
            max={6}
            onChange={(next) => patch('story.points', next)}
            render={(item, update) => (
              <>
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextField label="Text" value={item.text} onChange={(v) => update({ text: v })} />
              </>
            )}
          />

          <div className="adm-card">
            <div className="adm-card__body adm-grid-2">
              <TextField label="Values eyebrow" value={payload.values.eyebrow} onChange={(v) => patch('values.eyebrow', v)} />
              <TextField label="Values heading" value={payload.values.heading} onChange={(v) => patch('values.heading', v)} />
              <TextField
                label="Timeline eyebrow"
                value={payload.timeline.eyebrow}
                onChange={(v) => patch('timeline.eyebrow', v)}
              />
              <TextField
                label="Timeline heading"
                value={payload.timeline.heading}
                onChange={(v) => patch('timeline.heading', v)}
              />
            </div>
          </div>

          <ListEditor
            title="What we hold to"
            items={payload.values.items ?? []}
            blank={{ title: '', text: '' }}
            max={8}
            onChange={(next) => patch('values.items', next)}
            render={(item, update) => (
              <>
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextField label="Text" value={item.text} onChange={(v) => update({ text: v })} />
              </>
            )}
          />

          <ListEditor
            title="Milestones"
            items={payload.timeline.items ?? []}
            blank={{ year: '', title: '', text: '' }}
            max={12}
            onChange={(next) => patch('timeline.items', next)}
            render={(item, update) => (
              <>
                <TextField label="Year" value={item.year} onChange={(v) => update({ year: v })} />
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextField label="Text" value={item.text} onChange={(v) => update({ text: v })} />
              </>
            )}
          />
        </>
      ) : (
        <>
          <ListEditor
            title="Contact cards (also used in the site footer)"
            items={payload.cards ?? []}
            blank={{ icon: 'phone', label: '', value: '', href: '', note: '' }}
            max={6}
            onChange={(next) => patch('cards', next)}
            render={(item, update) => (
              <>
                <label className="adm-field">
                  <span>Icon</span>
                  <select value={item.icon} onChange={(event) => update({ icon: event.target.value })}>
                    {ICONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} />
                <TextField label="Value" value={item.value} onChange={(v) => update({ value: v })} />
                <TextField
                  label="Link"
                  value={item.href}
                  onChange={(v) => update({ href: v })}
                  hint="Optional: tel:+94..., mailto:..., https://..."
                />
                <TextField label="Note" value={item.note} onChange={(v) => update({ note: v })} />
              </>
            )}
          />

          <div className="adm-card">
            <div className="adm-card__head">
              <h2>Aside panel</h2>
            </div>
            <div className="adm-card__body adm-grid-2">
              <TextField label="Heading" value={payload.aside.heading} onChange={(v) => patch('aside.heading', v)} />
              <TextField label="Text" value={payload.aside.text} onChange={(v) => patch('aside.text', v)} textarea />
              <TextField
                label="Map label"
                value={payload.aside.mapLabel}
                onChange={(v) => patch('aside.mapLabel', v)}
                hint="Shown over the illustrated map."
              />
            </div>
          </div>
        </>
      )}

      <div className="adm-card">
        <div className="adm-card__body">
          <p className="adm-table__muted">
            Changes appear on the public page as soon as you save. The header illustration and the
            story image are drawn by the site; photos and clips live in the media library and are
            used by the gallery and journal covers.
          </p>
        </div>
      </div>
    </>
  )
}
