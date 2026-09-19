import { Link } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import EnquiryForm from '../components/plan/EnquiryForm'
import Reveal from '../components/ui/Reveal'
import { ArrowRight, Clock, Mail, MapPin, Phone } from '../components/ui/Icons'
import PHOTOS from '../data/photos'
import { useAuth } from '../auth/AuthContext'
import { usePageContent } from '../hooks/usePageContent'
import { api } from '../api/client'

const ICONS = { phone: Phone, mail: Mail, map: MapPin, clock: Clock }

export default function Contact() {
  // Everything on this page is editable in the admin console; see usePageContent.
  const { content } = usePageContent('contact')
  const { mayBook } = useAuth()
  const { hero, cards, aside } = content

  return (
    <main className="page-enter">
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        crumbs={[{ label: 'Contact' }]}
        image={hero.image ? api.mediaUrl(hero.image) : PHOTOS.pageHero.contact}
        scenery={hero.scenery}
      />

      <section className="section">
        <div className="container">
          <div className="grid grid--4 contact-cards">
            {/* A card with nothing in it is not a card: the phone stays hidden until a number is set. */}
            {(cards ?? [])
              .filter((card) => card.value)
              .map((card, index) => {
                const Icon = ICONS[card.icon] ?? Phone
                return (
                  <Reveal key={card.label} delay={index * 90}>
                    <div className="card contact-card">
                      <span className="contact-card__icon">
                        <Icon width={18} height={18} />
                      </span>
                      <span className="contact-card__label">{card.label}</span>
                      {card.href ? (
                        <a className="contact-card__value" href={card.href}>
                          {card.value}
                        </a>
                      ) : (
                        <strong className="contact-card__value">{card.value}</strong>
                      )}
                      <p>{card.note}</p>
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
                <h3>{aside.heading}</h3>
                <p>{aside.text}</p>
                {mayBook && (
                  <Link className="btn btn--cta btn--sweep btn--block" to="/plan#track">
                    Track a booking
                    <ArrowRight width={15} height={15} />
                  </Link>
                )}
              </div>

              <div className="card contact-panel contact-panel--map">
                <img src={PHOTOS.contactMap} alt="" loading="lazy" />
                <div className="contact-panel__map-label">
                  <MapPin width={15} height={15} />
                  {aside.mapLabel}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
