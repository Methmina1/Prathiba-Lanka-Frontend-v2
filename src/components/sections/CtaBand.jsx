import { ArrowRight, Phone, WhatsApp } from '../ui/Icons'

export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container cta-band__inner">
        <div>
          <h2>The journey awaits</h2>
          <p>Tell us when you are coming and we will send a first outline within a working day.</p>
        </div>
        <div className="cta-band__actions">
          <a className="btn btn--primary" href="#plan">
            Begin your journey
            <ArrowRight width={16} height={16} />
          </a>
          <a className="btn btn--ghost" href="tel:+94770000000">
            <Phone width={15} height={15} />
            +94 77 000 0000
          </a>
        </div>
      </div>

      <a className="whatsapp-fab" href="#plan" aria-label="Chat with us">
        <WhatsApp width={22} height={22} />
      </a>
    </section>
  )
}
