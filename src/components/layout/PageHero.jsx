import { Link } from 'react-router-dom'
import Scenery from '../ui/Scenery'

/**
 * The header band used by every page except the home page: breadcrumb, eyebrow, title, lede and
 * optional actions, over a photograph (or the drawn scene when no image is given).
 */
export default function PageHero({ eyebrow, title, lede, crumbs = [], scenery, image, alt, children }) {
  return (
    <section className={`page-hero ${scenery || image ? 'page-hero--media' : ''}`}>
      {(image || scenery) && (
        <div className="page-hero__media" aria-hidden="true">
          {/* aria-hidden, so the image is decorative to a screen reader - the heading beside it says
              the same thing. The alt text is still worth having: Google Images reads it, and on a
              journey page this photograph is the most visible thing on the site. */}
          {image ? <img src={image} alt={alt ?? ''} /> : <Scenery variant={scenery} ratio="16 / 9" />}
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
