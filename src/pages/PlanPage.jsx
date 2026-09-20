import { Link } from 'react-router-dom'
import EnquiryForm from '../components/plan/EnquiryForm'
import TrackBooking from '../components/plan/TrackBooking'
import TrustBar from '../components/sections/TrustBar'
import Reveal from '../components/ui/Reveal'
import { useAuth } from '../auth/AuthContext'
import { ArrowRight } from '../components/ui/Icons'

const STEPS = [
  { title: 'Send the outline', text: 'Your dates, roughly what you would like to see, and how many of you.' },
  { title: 'Get a draft', text: 'A consultant replies with an itinerary and a price, usually within a working day.' },
  { title: 'Confirm and go', text: 'We book it, send your PIN and documents, and meet you at the airport.' },
]

export default function PlanPage() {
  const { session, email, mayBook, signOut } = useAuth()
  const isAdmin = session?.role === 'ROLE_ADMIN'

  // Staff do not book trips. Rather than showing an administrator the enquiry and tracking forms and
  // letting the backend refuse them, the page says why and points at the console.
  if (!mayBook) {
    return (
      <main className="page-enter">
        <section className="page-hero">
          <div className="container page-hero__inner">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Plan your journey</span>
            </nav>
            <span className="eyebrow eyebrow--onDark">Staff account</span>
            <h1 className="display">Booking is for customers</h1>
            <p>
              You are signed in as an administrator ({email}). Journeys are requested from a customer
              account, so this page is not available to staff - the booking and review endpoints
              refuse an admin token.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container empty-state">
            <h3>Manage the bookings instead</h3>
            <p>
              Hold or reject requests, answer enquiries and edit the catalogue from the console. To
              test the customer side, sign in with a customer account.
            </p>
            <Link className="btn btn--cta btn--sweep" to="/admin/bookings">
              Open the console
              <ArrowRight width={15} height={15} />
            </Link>
            <button type="button" className="btn btn--ghost" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page-enter">
      <section className="page-hero">
        <div className="container page-hero__inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Plan your journey</span>
          </nav>
          <span className="eyebrow eyebrow--onDark">Start here</span>
          <h1 className="display">Plan your journey</h1>
          <p>
            Send us the outline of a trip, or look up a request you have already made with its PIN.
            No account needed for either.
          </p>
        </div>
      </section>

      <TrustBar />

      <section className="section">
        <div className="container">
          <div className="plan">
            <Reveal variant="reveal--right">
              <EnquiryForm />
            </Reveal>
            <Reveal delay={140} variant="reveal--right">
              <TrackBooking />
            </Reveal>

            <Reveal delay={200}>
              <div className="card plan__account">
                <div>
                  <span className="eyebrow">Your account</span>
                  <h3>{session ? `Signed in as ${email ?? 'your account'}` : 'Already travelling with us?'}</h3>
                  <p>
                    {session
                      ? 'Your requests, confirmed dates and reviews are all on your account page.'
                      : 'An account keeps your requests, confirmed dates and reviews in one place. It is optional - the forms above work without one.'}
                  </p>
                </div>

                <div className="plan__account-actions">
                  {session ? (
                    <>
                      <Link className="btn btn--cta btn--sweep" to={isAdmin ? '/admin' : '/account'}>
                        {isAdmin ? 'Staff dashboard' : 'Go to my account'}
                        <ArrowRight width={15} height={15} />
                      </Link>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => signOut()}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link className="btn btn--cta btn--sweep" to="/login">
                        Sign in
                        <ArrowRight width={15} height={15} />
                      </Link>
                      <Link className="link-arrow" to="/register">
                        Create an account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">How it works</span>
            <h2>Three steps, then the island</h2>
          </div>

          <div className="grid grid--3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 120}>
                <article className="card step-card">
                  <span className="step-card__number">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="section-cta">
            <Link className="link-arrow" to="/#journeys">
              Back to the journeys
              <ArrowRight width={15} height={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
