import { Facebook, Instagram, Mail, MapPin, Phone, WhatsApp } from '../ui/Icons'

const DISCOVER = [
  { label: 'Home', href: '#top' },
  { label: 'Our philosophy', href: '#philosophy' },
  { label: 'The journal', href: '#journal' },
  { label: 'Track a booking', href: '#plan' },
]

const JOURNEYS = [
  { label: 'Cultural Triangle', href: '#journeys' },
  { label: 'Wildlife & Safari', href: '#journeys' },
  { label: 'Hill Country', href: '#journeys' },
  { label: 'Southern Coast', href: '#journeys' },
]

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer__grid">
        <div className="footer__brand">
          <a className="brand brand--footer" href="#top">
            <img src="/logo.png" alt="" className="brand__mark" />
            <span className="brand__text">
              <strong>PrathibaLanka</strong>
              <small>Sri Lanka, arranged with care</small>
            </span>
          </a>
          <p>
            Private, tailor-made journeys across Sri Lanka - built by people who live here and
            driven by guides who know the back roads.
          </p>
          <div className="footer__social">
            <a href="#top" aria-label="Facebook">
              <Facebook />
            </a>
            <a href="#top" aria-label="Instagram">
              <Instagram />
            </a>
            <a href="#top" aria-label="WhatsApp">
              <WhatsApp />
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Discover</h4>
          <ul>
            {DISCOVER.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>Journeys</h4>
          <ul>
            {JOURNEYS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>Talk to us</h4>
          <ul className="footer__contact">
            <li>
              <Phone width={16} height={16} />
              <a href="tel:+94770000000">+94 77 000 0000</a>
            </li>
            <li>
              <Mail width={16} height={16} />
              <a href="mailto:hello@prathibalanka.lk">hello@prathibalanka.lk</a>
            </li>
            <li>
              <MapPin width={16} height={16} />
              <span>Colombo, Sri Lanka</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} PrathibaLanka. All rights reserved.</span>
        <span className="footer__meta">Placeholder contact details - update before launch.</span>
      </div>
    </footer>
  )
}
