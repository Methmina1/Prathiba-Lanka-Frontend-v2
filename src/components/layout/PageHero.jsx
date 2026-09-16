import { Link } from 'react-router-dom'
import Scenery from '../ui/Scenery'

/**
 * The header band used by every page except the home page: breadcrumb, eyebrow, title, lede and
 * optional actions, over a duskier version of the illustrated scenery.
 */
export default function PageHero({ eyebrow, title, lede, crumbs = [], scenery, children }) {
  return (
    <section className={`page-hero ${scenery ? 'page-hero--media' : ''}`}>
      {scenery && (
        <div className="page-hero__media" aria-hidden="true">
          <Scenery variant={scenery} ratio="16 / 9" />
          <div className="page-hero__scrim" />
        </div>
      )}

      <div className="container page-hero__inner">
        {crumbs.length > 0 && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {crumbs.map((crumb) => (
              <span key={crumb.label}>
                <span aria-hidden="true">/</span>
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              </span>
            ))}
          </nav>
        )}

        <span className="eyebrow eyebrow--onDark">{eyebrow}</span>
        <h1 className="display">{title}</h1>
        {lede && <p>{lede}</p>}
        {children}
      </div>
    </section>
  )
}
