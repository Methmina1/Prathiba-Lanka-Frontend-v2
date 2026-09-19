import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Close, Menu } from '../ui/Icons'
import { useAuth } from '../../auth/AuthContext'

const NAV = [
  { label: 'Home', to: '/' },
  {
    label: 'Journeys',
    to: '/journeys',
    children: [
      { label: 'All journeys', to: '/journeys' },
      { label: 'Cultural Triangle', to: '/journeys?destination=cultural' },
      { label: 'Wildlife & Safari', to: '/journeys?destination=yala' },
      { label: 'Hill Country', to: '/journeys?destination=ella' },
      { label: 'Southern Coast', to: '/journeys?destination=galle' },
    ],
  },
  { label: 'Journal', to: '/journal' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  // The logo and the navbar background belong to the very top of the page only: past a few pixels
  // the bar goes transparent and the mark fades out.
  const [atTop, setAtTop] = useState(true)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { session, email, isAdmin, mayBook, signOut } = useAuth()

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

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to.split('?')[0]))

  return (
    <header className={`site-header ${atTop ? 'is-top' : 'is-scrolled'}`}>
      <div className="navbar">
        <div className="container navbar__inner">
          <Link className="brand" to="/" aria-label="PrathibaLanka home">
            <img src="/logo-mark.png" alt="" className="brand__mark" />
            <span className="brand__text">
              <strong>PrathibaLanka</strong>
              <small>Journeys through the emerald isle</small>
            </span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <div className={`nav__item ${item.children ? 'has-menu' : ''}`} key={item.label}>
                <Link className={`nav__link ${isActive(item.to) ? 'is-active' : ''}`} to={item.to}>
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
            {/* Signed-out visitors sign in from the plan page; the bar stays navigation + the CTA. */}
            {session && (
              <Link className="navbar__auth" to={isAdmin ? '/admin' : '/account'}>
                {email ? email.split('@')[0] : isAdmin ? 'Admin' : 'Account'}
              </Link>
            )}
            {/* Staff do not book trips, so the booking call to action is not shown to them. */}
            {mayBook && (
              <Link className="btn btn--cta btn--sweep btn--sm" to="/plan">
                Plan your trip
              </Link>
            )}
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
          {mayBook && (
            <Link className="mobile-menu__track" to="/plan#track" onClick={() => setOpen(false)}>
              Track your booking
            </Link>
          )}
          {session && (
            <>
              <Link to={isAdmin ? '/admin' : '/account'} onClick={() => setOpen(false)}>
                {isAdmin ? 'Staff dashboard' : 'My account'}
              </Link>
              <button
                type="button"
                className="mobile-menu__track"
                onClick={() => {
                  setOpen(false)
                  signOut()
                  navigate('/', { replace: true })
                }}
              >
                Sign out
              </button>
            </>
          )}
          {mayBook && (
            <Link className="btn btn--cta btn--block" to="/plan" onClick={() => setOpen(false)}>
              Plan your trip
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
