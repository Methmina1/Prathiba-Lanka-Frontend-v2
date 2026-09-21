import { Link } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import EnquiryForm from '../components/plan/EnquiryForm'
import Reveal from '../components/ui/Reveal'
import {
  ArrowRight,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  TikTok,
  WhatsApp,
} from '../components/ui/Icons'
import PHOTOS from '../data/photos'
import SOCIAL_LINKS from '../data/social'
import { useAuth } from '../auth/AuthContext'
import { usePageContent } from '../hooks/usePageContent'
import { api } from '../api/client'

const ICONS = { phone: Phone, mail: Mail, map: MapPin, clock: Clock, whatsapp: WhatsApp }

/** An icon per social account; a profile we have no icon for simply shows the label. */
const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: TikTok,
  whatsapp: WhatsApp,
}

/**
 * Contact.
 *
 * Everything in the top half is editable in the admin console (see usePageContent); the social band
 * at the bottom comes from src/data/social.js, which the footer reads too, so a new account is
 * added in one place.
 *
 * The page is also the site's most animated one - the aurora behind it, the thread joining the
 * contact cards, the pulse on the office pin, the tape and the tilt on the social tiles. All of it is
 * CSS, scoped to .contact-page, and all of it collapses under prefers-reduced-motion (the global
 * block at the end of components.css).
 */
export default function Contact() {
  const { content } = usePageContent('contact')
  const { mayBook } = useAuth()
  const { hero, cards, aside } = content

  return (
    <main className="page-enter contact-page">
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        crumbs={[{ label: 'Contact' }]}
        image={hero.image ? api.mediaUrl(hero.image) : PHOTOS.pageHero.contact}
        scenery={hero.scenery}
      />

      <section className="section contact-main">
        <div className="container">
          <div className="grid grid--4 contact-cards">
            {/* A card with nothing in it is not a card: the phone stays hidden until a number is set. */}
            {(cards ?? [])
              .filter((card) => card.value)
              .map((card, index) => {
                const Icon = ICONS[card.icon] ?? Phone
                return (
                  <Reveal key={card.label} delay={index * 110} variant="reveal--zoom">
                    <div className="card contact-card" style={{ '--card-index': index }}>
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

            <Reveal delay={140} className="contact-aside">
              <div className="card contact-panel contact-panel--lift">
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
                  <span className="contact-panel__pin" aria-hidden="true" />
                  <MapPin width={15} height={15} />
                  {aside.mapLabel}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- where we post ---------------------------------------------------------------------
          The accounts from src/data/social.js, pinned up like the gallery's scrapbook: a card each,
          with tape, a tilt and the handle written underneath. WhatsApp is here too: it is where the
          agency actually answers, so it sits with the profiles rather than only in the footer. */}
      <section className="section section--muted contact-social" id="follow">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <span className="eyebrow">Where we post</span>
            <h2>Come along between journeys</h2>
            <p className="lede">
              Photographs from the road, which hotels we keep going back to, and the small things that
              only turn up on the day - posted as they happen. And if you would rather just ask us,
              WhatsApp is on this list too.
            </p>
          </Reveal>

          <div className="social-wall">
            {SOCIAL_LINKS.map((link, index) => {
              const Icon = SOCIAL_ICONS[link.id] ?? Mail
              return (
                <Reveal key={link.id} delay={index * 120} className="social-wall__cell">
                  <a
                    className={`social-card social-card--${link.id}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={link.handle}
                  >
                    <span className="social-card__glow" aria-hidden="true" />

                    <span className="social-card__top">
                      <span className="social-card__icon">
                        <Icon width={24} height={24} />
                      </span>
                      <span className="social-card__label">{link.label}</span>
                    </span>

                    <span className="social-card__handle">{link.display}</span>

                    <span className="social-card__go">
                      {link.cta ?? 'Follow along'}
                      <ArrowRight width={15} height={15} />
                    </span>
                  </a>
                </Reveal>
              )
            })}

            <Reveal delay={300} className="social-wall__cell social-wall__cell--note">
              <div className="social-note">
                <span className="social-note__pin" aria-hidden="true" />
                <strong>A message reaches us faster</strong>
                <p>
                  A WhatsApp message or a direct message on any of these is the quickest way to ask
                  about dates, rooms or a journey you have half-planned. Anything longer, use the form
                  on the left.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
