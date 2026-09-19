import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { fallbackPackages } from '../../data/fallback'
import { useApi } from '../../hooks/useApi'
import PackageCard from '../ui/PackageCard'
import Reveal from '../ui/Reveal'

/** The home page shows two rows of three; the rest live on the journeys page. */
const SHOWN = 6

export default function Packages() {
  const { data: packages, status } = useApi(() => api.getPackages(), fallbackPackages)
  const shown = packages.slice(0, SHOWN)

  return (
    <section className="section section--muted" id="journeys">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <span className="eyebrow">Curated journeys</span>
          <h2>Signature journeys</h2>
          <p className="lede">
            Starting points, not fixed departures. Every itinerary below can be stretched, shortened
            or rebuilt around your dates.
          </p>
        </Reveal>

        {status === 'fallback' && (
          <p className="notice">
            Showing sample journeys. Start the backend on port 8080 and these load from
            <code> /api/packages</code>.
          </p>
        )}

        {status === 'live' && packages.length < 4 && (
          <p className="notice">
            {packages.length} package{packages.length === 1 ? '' : 's'} in the database so far - the
            remaining tiles fill up as you add them through <code>/api/admin/packages</code>.
          </p>
        )}

        <div className="grid grid--3">
          {shown.map((pkg, index) => (
            <Reveal key={pkg.packageId} delay={index * 110} variant="reveal--zoom">
              <PackageCard pkg={pkg} index={index} />
            </Reveal>
          ))}
        </div>

        <div className="section-cta">
          <Link className="btn btn--cta btn--sweep" to="/journeys">
            {packages.length > shown.length
              ? `See all ${packages.length} journeys`
              : 'See every journey'}
          </Link>
          <p className="section-cta__note">
            Each one is a starting point. Tell us your dates and we will reshape it.
          </p>
        </div>
      </div>
    </section>
  )
}
