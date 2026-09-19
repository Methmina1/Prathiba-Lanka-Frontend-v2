import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Close, Menu, User } from '../ui/Icons'
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
  const { session, isAdmin, mayBook, signOut } = useAuth()

  /**
   * Signing out is a way out of the account, not just a state change: the account and console pages
   * need a session, so staying on one would bounce straight to the login form. Home is the honest
   * place to land, and `replace` keeps the signed-in page out of the history.
   */
  const signOutToHome = () => {
    setOpen(false)
    signOut()
    navigate('/', { replace: true })
  }

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
            {/* Who is signed in is not shown here: the bar is a public page, and the name or the
                address is nobody else's business. A way into the account, and a way out, is. */}
            {session && (
              <div className="navbar__account">
                <Link
                  className="navbar__auth"
                  to={isAdmin ? '/admin' : '/account'}
                  aria-label={isAdmin ? 'Staff console' : 'Your account'}
                  title={isAdmin ? 'Staff console' : 'Your account'}
                >
                  <User width={16} height={16} />
                  <span>{isAdmin ? 'Console' : 'Account'}</span>
                </Link>
                <button type="button" className="navbar__signout" onClick={signOutToHome}>
                  Sign out
                </button>
              </div>
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
                {isAdmin ? 'Staff console' : 'My account'}
              </Link>
              <button type="button" className="mobile-menu__track" onClick={signOutToHome}>
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
