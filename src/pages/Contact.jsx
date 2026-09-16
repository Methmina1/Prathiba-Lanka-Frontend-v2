import { Link } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import EnquiryForm from '../components/plan/EnquiryForm'
import Reveal from '../components/ui/Reveal'
import Scenery from '../components/ui/Scenery'
import { ArrowRight, Clock, Mail, MapPin, Phone } from '../components/ui/Icons'

const DETAILS = [
  {
    icon: Phone,
    label: 'Call or WhatsApp',
    value: '+94 77 000 0000',
    href: 'tel:+94770000000',
    note: 'Answered 08:00 - 21:00 Sri Lanka time',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@prathibalanka.lk',
    href: 'mailto:hello@prathibalanka.lk',
    note: 'Replies within one working day',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Colombo, Sri Lanka',
    note: 'Visits by appointment',
  },
  {
    icon: Clock,
    label: 'Response time',
    value: 'Under 24 hours',
    note: 'Usually the same afternoon',
  },
]

export default function Contact() {
  return (
    <main className="page-enter">
      <PageHero
        eyebrow="Contact"
        title="Talk to us"
        lede="Tell us roughly when you are coming and what you would like to see. A consultant replies with a draft itinerary and a price."
        crumbs={[{ label: 'Contact' }]}
        scenery="coast"
      />

      <section className="section">
        <div className="container">
          <div className="grid grid--4 contact-cards">
            {DETAILS.map((detail, index) => {
              const Icon = detail.icon
              return (
                <Reveal key={detail.label} delay={index * 90}>
                  <div className="card contact-card">
                    <span className="contact-card__icon">
                      <Icon width={18} height={18} />
                    </span>
                    <span className="contact-card__label">{detail.label}</span>
                    {detail.href ? (
                      <a className="contact-card__value" href={detail.href}>
                        {detail.value}
                      </a>
                    ) : (
                      <strong className="contact-card__value">{detail.value}</strong>
                    )}
                    <p>{detail.note}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <div className="contact-split">
            <Reveal>
              <EnquiryForm />
            </Reveal>

            <Reveal delay={120} className="contact-aside">
              <div className="card contact-panel">
                <h3>Already sent a request?</h3>
                <p>
                  Every enquiry gets an eight-character PIN. Use it to follow the progress of your
                  booking at any time - no account needed.
                </p>
                <Link className="btn btn--cta btn--sweep btn--block" to="/plan#track">
                  Track a booking
                  <ArrowRight width={15} height={15} />
                </Link>
              </div>

              <div className="card contact-panel contact-panel--map">
                <Scenery variant="hills" ratio="16 / 9" />
                <div className="contact-panel__map-label">
                  <MapPin width={15} height={15} />
                  Colombo, Sri Lanka
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
