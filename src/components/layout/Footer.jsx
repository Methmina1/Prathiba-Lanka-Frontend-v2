import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone, TikTok, WhatsApp } from '../ui/Icons'
import { CONTACT_FALLBACK, SOCIAL_LINKS, whatsappFrom } from '../../data/social'
import { useAuth } from '../../auth/AuthContext'
import { usePageContent } from '../../hooks/usePageContent'

const DISCOVER = [
  { label: 'Home', to: '/' },
  { label: 'Our story', to: '/about' },
  { label: 'The journal', to: '/journal' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Reviews', to: '/reviews' },
]

const JOURNEYS = [
  { label: 'All journeys', to: '/journeys' },
  { label: 'Cultural Triangle', to: '/journeys?destination=cultural' },
  { label: 'Wildlife & Safari', to: '/journeys?destination=yala' },
  { label: 'Hill Country', to: '/journeys?destination=ella' },
  { label: 'Southern Coast', to: '/journeys?destination=galle' },
]

const SOCIAL_ICONS = { facebook: Facebook, instagram: Instagram, tiktok: TikTok, whatsapp: WhatsApp }

export default function Footer() {
  // The same contact details the Contact page shows, so editing them once updates both.
  const { mayBook } = useAuth()
  const { content } = usePageContent('contact')
  const cards = content.cards ?? []
  const phone = cards.find((card) => card.href?.startsWith('tel:') && card.value)
  const email = cards.find((card) => card.href?.startsWith('mailto:') && card.value)
  const office = cards.find((card) => card.icon === 'map')
  const whatsapp = whatsappFrom(cards)

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
            {SOCIAL_LINKS.map((social) => {
              const Icon = SOCIAL_ICONS[social.id]
              return (
                <a
                  key={social.id}
                  href={social.href}
                  aria-label={social.handle}
                  title={social.label}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon />
                </a>
              )
            })}
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
            {/* No voice number yet: the line goes rather than showing a placeholder nobody can dial.
                WhatsApp is the channel the agency actually answers on, so it leads. */}
            {whatsapp.value && (
              <li>
                <WhatsApp width={16} height={16} />
                <a href={whatsapp.href} target="_blank" rel="noreferrer noopener">
                  {whatsapp.value}
                </a>
              </li>
            )}
            {(phone?.value ?? CONTACT_FALLBACK.phone) ? (
              <li>
                <Phone width={16} height={16} />
                <a href={phone?.href ?? `tel:${CONTACT_FALLBACK.phone.replace(/\s/g, '')}`}>
                  {phone?.value ?? CONTACT_FALLBACK.phone}
                </a>
              </li>
            ) : null}
            <li>
              <Mail width={16} height={16} />
              <a href={email?.href ?? `mailto:${CONTACT_FALLBACK.email}`}>
                {email?.value ?? CONTACT_FALLBACK.email}
              </a>
            </li>
            <li>
              <MapPin width={16} height={16} />
              <span>{office?.value ?? CONTACT_FALLBACK.office}</span>
            </li>
          </ul>
          <ul className="footer__links">
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            {/* An administrator is staff, and staff cannot book: the backend refuses it with 403. */}
            {mayBook && (
              <>
                <li>
                  <Link to="/plan">Plan your journey</Link>
                </li>
                <li>
                  <Link to="/plan#track">Track a booking</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} PrathibaLanka. All rights reserved.</span>
        <div className="footer__bottom-meta">
          <Link className="footer__admin" to="/admin">
            Admin sign in
          </Link>
        </div>
      </div>
    </footer>
  )
}
