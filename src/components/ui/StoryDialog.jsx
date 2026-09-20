import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { firstSentence, formatDays, formatPrice, toParagraphs } from '../../utils/format'
import { ArrowRight, Close } from './Icons'

/**
 * The "read the full description" popup on the journeys page.
 *
 * The card only has room for two lines, so the write-up opens here: destination, title, the two
 * numbers people look for first, the paragraphs themselves, and the two ways on - the journey page
 * with its day-by-day itinerary, or the enquiry form.
 *
 * `pkg` is the package to show, or null when nothing is open. Escape, the close button and a click
 * on the backdrop all dismiss it, and the page behind is frozen while it is up.
 */
export default function StoryDialog({ pkg, onClose }) {
  const { mayBook } = useAuth()

  useEffect(() => {
    if (!pkg) return undefined

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [pkg, onClose])

  if (!pkg) return null

  // A journey with no write-up yet still opens something readable rather than an empty dialog.
  const paragraphs = toParagraphs(pkg.longDescription || pkg.description)
  const price = formatPrice(pkg.price)
  const days = formatDays(pkg.durationDays) ?? (pkg.durationDays ? `${pkg.durationDays} days` : null)

  return (
    <div
      className="story-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="story">
        <header className="story__head">
          <div className="story__heading">
            {pkg.destination && <span className="eyebrow">{pkg.destination}</span>}
            <h2 id="story-title">{pkg.title}</h2>
            <p className="story__meta">
              {[days, price ? `${price} per person` : 'Price on request'].filter(Boolean).join(' · ')}
            </p>
          </div>

          <button type="button" className="story__close" onClick={onClose} aria-label="Close" autoFocus>
            <Close width={20} height={20} />
          </button>
        </header>

        <div className="story__body">
          {pkg.imageUrl && (
            <img className="story__cover" src={api.mediaUrl(pkg.imageUrl)} alt="" loading="lazy" />
          )}
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>{firstSentence(pkg.description)}</p>
          )}
        </div>

        <footer className="story__foot">
          <Link className="btn btn--cta btn--sweep btn--sm" to={`/journeys/${pkg.packageId}`}>
            Day-by-day itinerary
            <ArrowRight width={15} height={15} />
          </Link>
          {mayBook && (
            <Link className="btn btn--ghost btn--sm" to="/plan">
              Request this journey
            </Link>
          )}
        </footer>
      </div>
    </div>
  )
}
