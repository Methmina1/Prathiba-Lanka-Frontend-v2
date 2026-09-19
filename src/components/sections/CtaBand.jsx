import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal'
import { ArrowRight, Phone, WhatsApp } from '../ui/Icons'
import PHOTOS from '../../data/photos'

export default function CtaBand() {
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
          <Link className="btn btn--cta btn--sweep" to="/plan">
            Begin your journey
            <ArrowRight width={16} height={16} />
          </Link>
          <a className="btn btn--onDark" href="tel:+94770000000">
            <Phone width={15} height={15} />
            +94 77 000 0000
          </a>
        </Reveal>
      </div>

      <Link className="whatsapp-fab" to="/plan" aria-label="Plan your journey">
        <WhatsApp width={22} height={22} />
      </Link>
    </section>
  )
}
