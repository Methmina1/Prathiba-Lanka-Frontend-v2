import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal'
import { ArrowRight, Mail, Phone, WhatsApp } from '../ui/Icons'
import PHOTOS from '../../data/photos'
import { CONTACT_FALLBACK } from '../../data/social'
import { useAuth } from '../../auth/AuthContext'
import { usePageContent } from '../../hooks/usePageContent'

export default function CtaBand() {
  // The same contact cards the Contact page and the footer read, so the number here is the real one
  // - and while there is no number, the button is not shown at all.
  const { mayBook } = useAuth()
  const { content } = usePageContent('contact')
  const cards = content.cards ?? []
  const phone = cards.find((card) => card.href?.startsWith('tel:') && card.value)
  const phoneValue = phone?.value ?? CONTACT_FALLBACK.phone

  return (
    <section className="cta-band">
      <div className="cta-band__media" aria-hidden="true">
        <img src={PHOTOS.ctaBand} alt="" loading="lazy" />
      </div>

      <div className="container cta-band__inner">
        <Reveal>
          <h2>The journey awaits</h2>
          <p>Tell us when you are coming and we will send a first outline within a working day.</p>
        </Reveal>
        <Reveal delay={150} className="cta-band__actions">
          {/* Staff are pointed at their own console rather than at a booking form they cannot use. */}
          {mayBook ? (
            <Link className="btn btn--cta btn--sweep" to="/plan">
              Begin your journey
              <ArrowRight width={16} height={16} />
            </Link>
          ) : (
            <Link className="btn btn--cta btn--sweep" to="/admin">
              Open the admin console
              <ArrowRight width={16} height={16} />
            </Link>
          )}
          {phoneValue ? (
            <a className="btn btn--onDark" href={phone?.href ?? `tel:${phoneValue.replace(/\s/g, '')}`}>
              <Phone width={15} height={15} />
              {phoneValue}
            </a>
          ) : (
            <a className="btn btn--onDark" href={`mailto:${CONTACT_FALLBACK.email}`}>
              <Mail width={15} height={15} />
              Email us
            </a>
          )}
        </Reveal>
      </div>

      {mayBook && (
        <Link className="whatsapp-fab" to="/plan" aria-label="Plan your journey">
          <WhatsApp width={22} height={22} />
        </Link>
      )}
    </section>
  )
}
