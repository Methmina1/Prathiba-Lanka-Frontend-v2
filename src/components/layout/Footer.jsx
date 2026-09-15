import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, WhatsApp } from '../ui/Icons'

const DISCOVER = [
  { label: 'Home', to: '/' },
  { label: 'Our philosophy', to: '/#philosophy' },
  { label: 'The journal', to: '/#journal' },
  { label: 'Plan your journey', to: '/plan' },
  { label: 'Track a booking', to: '/plan#track' },
]

const JOURNEYS = [
  { label: 'Cultural Triangle', to: '/#journeys' },
  { label: 'Wildlife & Safari', to: '/#journeys' },
  { label: 'Hill Country', to: '/#journeys' },
  { label: 'Southern Coast', to: '/#journeys' },
]

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link className="brand brand--footer" to="/">
            <img src="/logo-mark.png" alt="" className="brand__mark" />
            <span className="brand__text">
              <strong>PrathibaLanka</strong>
              <small>Sri Lanka, arranged with care</small>
            </span>
          </Link>
          <p>
            Private, tailor-made journeys across Sri Lanka - built by people who live here and
            driven by guides who know the back roads.
          </p>
          <div className="footer__social">
            <a href="/#" aria-label="Facebook">
              <Facebook />
            </a>
            <a href="/#" aria-label="Instagram">
              <Instagram />
            </a>
            <a href="/#" aria-label="WhatsApp">
              <WhatsApp />
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Discover</h4>
          <ul>
            {DISCOVER.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>Journeys</h4>
          <ul>
            {JOURNEYS.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
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
