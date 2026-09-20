import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import Scenery from '../ui/Scenery'
import { ArrowRight, Users } from '../ui/Icons'

function sceneryFor(pkg, index) {
  if (pkg.scenery) return pkg.scenery
  const haystack = `${pkg.title ?? ''} ${pkg.destination ?? ''}`.toLowerCase()
  if (/cultur|temple|sigiriya|kandy|anuradhapura|polonnaruwa|heritage/.test(haystack)) return 'temple'
  if (/wild|safari|yala|leopard|elephant|minneriya|park/.test(haystack)) return 'safari'
  if (/tea|hill|ella|nuwara|mist|train/.test(haystack)) return 'tea'
  if (/coast|beach|galle|mirissa|south|sea|surf/.test(haystack)) return 'coast'
  return ['temple', 'safari', 'tea', 'coast'][index % 4]
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return null
  const value = Number(price)
  if (Number.isNaN(value)) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function PackageCard({ pkg, index = 0, onReadStory }) {
  const { mayBook } = useAuth()
  const scenery = sceneryFor(pkg, index)
  const price = formatPrice(pkg.price)
  const days = pkg.durationDays ? `${pkg.durationDays} days` : null
  // The card carries two lines of the short description; the written-up version opens in a dialog
  // where the page provides one.
  const hasStory = Boolean(onReadStory && pkg.longDescription)

  return (
    <article className="card package-card">
      <Link className="package-card__media" to={`/journeys/${pkg.packageId}`} aria-label={pkg.title}>
        {/* The cover uploaded in the console wins; otherwise the drawn scene stands in. */}
        {pkg.imageUrl ? (
          <img src={api.mediaUrl(pkg.imageUrl)} alt={pkg.title} loading="lazy" />
        ) : (
          <Scenery variant={scenery} ratio="3 / 2" />
        )}
        {days && <span className="package-card__days">{days}</span>}
      </Link>

      <div className="package-card__body">
        {pkg.destination && <span className="pill pill--green">{pkg.destination}</span>}
        <h3>
          <Link to={`/journeys/${pkg.packageId}`}>{pkg.title}</Link>
        </h3>
        {pkg.description && <p className="package-card__text">{pkg.description}</p>}

        {hasStory && (
          <button type="button" className="package-card__story" onClick={() => onReadStory(pkg)}>
            Read the full description
            <ArrowRight width={15} height={15} />
          </button>
        )}

        <div className="package-card__foot">
          <div className="package-card__price">
            {price ? (
              <>
                <small>from</small>
                <strong>{price}</strong>
                <small>per person</small>
              </>
            ) : (
              <small>Price on request</small>
            )}
          </div>

          <div className="package-card__meta">
            {pkg.maxCapacity ? (
              <span>
                <Users width={15} height={15} />
                {pkg.maxCapacity} max
              </span>
            ) : null}
            <Link className="link-arrow" to={`/journeys/${pkg.packageId}`}>
              Details
              <ArrowRight width={15} height={15} />
            </Link>
            {mayBook && (
              <Link className="link-arrow" to="/plan">
                Request
                <ArrowRight width={15} height={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
