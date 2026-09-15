import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="page-enter">
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow eyebrow--onDark">404</span>
          <h1 className="display">This path leads nowhere</h1>
          <p>
            The page you were looking for is not here. The island, however, still is.
          </p>
          <p style={{ marginTop: '2rem' }}>
            <Link className="btn btn--cta btn--sweep" to="/">
              Back to the home page
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
