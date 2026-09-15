import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Close, Mail, Menu, Phone } from '../ui/Icons'

const NAV = [
  { label: 'Home', to: '/' },
  {
    label: 'Journeys',
    to: '/#journeys',
    children: [
      { label: 'Cultural Triangle', to: '/#journeys' },
      { label: 'Wildlife & Safari', to: '/#journeys' },
      { label: 'Hill Country', to: '/#journeys' },
      { label: 'Southern Coast', to: '/#journeys' },
    ],
  },
  { label: 'Journal', to: '/#journal' },
  { label: 'Gallery', to: '/#gallery' },
  { label: 'Reviews', to: '/#reviews' },
  { label: 'Contact', to: '/#contact' },
]

export default function Header() {
  // The logo and the navbar background belong to the very top of the page only: past a few pixels
  // the bar goes transparent and the mark fades out.
  const [atTop, setAtTop] = useState(true)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 4)
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

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
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
          <Link className="topbar__track" to="/plan#track">
            Track your booking with a PIN
          </Link>
        </div>
      </div>

      <header className={`site-header ${atTop ? 'is-top' : 'is-scrolled'}`}>
        <div className="navbar">
        <div className="container navbar__inner">
          <Link className="brand" to="/" aria-label="PrathibaLanka home">
            <img src="/logo.png" alt="" className="brand__mark" />
            <span className="brand__text">
              <strong>PrathibaLanka</strong>
              <small>Journeys through the emerald isle</small>
            </span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <div className={`nav__item ${item.children ? 'has-menu' : ''}`} key={item.label}>
                <Link className={`nav__link ${pathname === item.to ? 'is-active' : ''}`} to={item.to}>
                  {item.label}
                  {item.children && <ChevronDown width={14} height={14} />}
                </Link>
                {item.children && (
                  <div className="nav__menu">
                    {item.children.map((child) => (
                      <Link key={child.label} to={child.to}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="navbar__actions">
            <Link className="btn btn--cta btn--sweep btn--sm" to="/plan">
              Plan your trip
            </Link>
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
            <Link key={item.label} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link className="mobile-menu__track" to="/plan#track" onClick={() => setOpen(false)}>
            Track your booking
          </Link>
          <Link className="btn btn--cta btn--block" to="/plan" onClick={() => setOpen(false)}>
            Plan your trip
          </Link>
        </nav>
        </div>
      </header>
    </>
  )
}
