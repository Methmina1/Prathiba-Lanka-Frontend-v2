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

export default function PackageCard({ pkg, index = 0 }) {
  const scenery = sceneryFor(pkg, index)
  const price = formatPrice(pkg.price)
  const days = pkg.durationDays ? `${pkg.durationDays} days` : null

  return (
    <article className="card package-card">
      <div className="package-card__media">
        <Scenery variant={scenery} ratio="3 / 2" />
        {days && <span className="package-card__days">{days}</span>}
      </div>

      <div className="package-card__body">
        {pkg.destination && <span className="pill pill--green">{pkg.destination}</span>}
        <h3>{pkg.title}</h3>
        {pkg.description && <p className="package-card__text">{pkg.description}</p>}

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
            <a className="link-arrow" href="#plan">
              Request
              <ArrowRight width={15} height={15} />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
