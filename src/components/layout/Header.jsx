import { useEffect, useState } from 'react'
import { ChevronDown, Close, Mail, Menu, Phone } from '../ui/Icons'

const NAV = [
  { label: 'Home', href: '#top' },
  { label: 'Journeys', href: '#journeys', children: [
    { label: 'Cultural Triangle', href: '#journeys' },
    { label: 'Wildlife & Safari', href: '#journeys' },
    { label: 'Hill Country', href: '#journeys' },
    { label: 'Southern Coast', href: '#journeys' },
  ] },
  { label: 'Journal', href: '#journal' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
]

export default function Header({ onTrackClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="topbar">
        <div className="container topbar__inner">
          <a className="topbar__item" href="tel:+94770000000">
            <Phone width={15} height={15} />
            <span>+94 77 000 0000</span>
          </a>
          <a className="topbar__item" href="mailto:hello@prathibalanka.lk">
            <Mail width={15} height={15} />
            <span>hello@prathibalanka.lk</span>
          </a>
          <button type="button" className="topbar__track" onClick={onTrackClick}>
            Track your booking with a PIN
          </button>
        </div>
      </div>

      <div className="navbar">
        <div className="container navbar__inner">
          <a className="brand" href="#top" aria-label="PrathibaLanka home">
            <img src="/logo.png" alt="" className="brand__mark" />
            <span className="brand__text">
              <strong>PrathibaLanka</strong>
              <small>Journeys through the emerald isle</small>
            </span>
          </a>

          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <div className={`nav__item ${item.children ? 'has-menu' : ''}`} key={item.label}>
                <a href={item.href} className="nav__link">
                  {item.label}
                  {item.children && <ChevronDown width={14} height={14} />}
                </a>
                {item.children && (
                  <div className="nav__menu">
                    {item.children.map((child) => (
                      <a key={child.label} href={child.href}>
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="navbar__actions">
            <a className="btn btn--cta btn--sm" href="#plan">
              Plan your trip
            </a>
            <button
              type="button"
              className="navbar__toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <div className={`mobile-menu ${open ? 'is-open' : ''}`}>
        <nav aria-label="Mobile">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <button
            type="button"
            className="mobile-menu__track"
            onClick={() => {
              setOpen(false)
              onTrackClick?.()
            }}
          >
            Track your booking
          </button>
          <a className="btn btn--cta btn--block" href="#plan" onClick={() => setOpen(false)}>
            Plan your trip
          </a>
        </nav>
      </div>
    </header>
  )
}
