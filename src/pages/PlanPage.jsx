import { Link } from 'react-router-dom'
import EnquiryForm from '../components/plan/EnquiryForm'
import TrackBooking from '../components/plan/TrackBooking'
import TrustBar from '../components/sections/TrustBar'
import Reveal from '../components/ui/Reveal'
import { ArrowRight } from '../components/ui/Icons'

const STEPS = [
  { title: 'Send the outline', text: 'Your dates, roughly what you would like to see, and how many of you.' },
  { title: 'Get a draft', text: 'A consultant replies with an itinerary and a price, usually within a working day.' },
  { title: 'Confirm and go', text: 'We book it, send your PIN and documents, and meet you at the airport.' },
]

export default function PlanPage() {
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
