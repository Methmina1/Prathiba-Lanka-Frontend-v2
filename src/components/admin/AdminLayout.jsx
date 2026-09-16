import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { ArrowRight, Close, Menu } from '../ui/Icons'

/** Route metadata: the sidebar, the page title and the subtitle all come from here. */
const NAV = [
  {
    to: '/admin',
    label: 'Dashboard',
    end: true,
    title: 'Dashboard',
    description: 'Everything that needs attention today.',
  },
  {
    to: '/admin/bookings',
    label: 'Bookings',
    title: 'Bookings',
    description: 'Confirm or reject the requests customers have made.',
  },
  {
    to: '/admin/queries',
    label: 'Contact queries',
    title: 'Contact queries',
    description: 'Enquiries from the website contact form.',
  },
  {
    to: '/admin/packages',
    label: 'Packages',
    title: 'Packages',
    description: 'The journeys on offer - create, edit, deactivate or remove.',
  },
  {
    to: '/admin/journal',
    label: 'Journal',
    title: 'Journal',
    description: 'Stories, drafts and publishing.',
  },
  {
    to: '/admin/gallery',
    label: 'Gallery',
    title: 'Gallery',
    description: 'Images shown on the public gallery.',
  },
  {
    to: '/admin/reviews',
    label: 'Reviews',
    title: 'Reviews',
    description: 'Moderate what travellers have written.',
  },
]

export function adminRouteMeta(pathname) {
  const exact = NAV.find((item) => item.to === pathname)
  if (exact) return exact
  const nested = NAV.filter((item) => item.to !== '/admin' && pathname.startsWith(`${item.to}/`)).sort(
    (a, b) => b.to.length - a.to.length
  )[0]
  return nested ?? NAV[0]
}

export default function AdminLayout() {
  const { session, ready, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
    // the console has its own shell, so ScrollToTop (which lives in SiteLayout) does not run here
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (!ready) {
    return (
      <div className="adm-denied">
        <div className="adm-denied__inner">
          <p>Checking your session…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    const next = encodeURIComponent(location.pathname)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (session.role !== 'ROLE_ADMIN') {
    return (
      <div className="adm-denied">
        <div className="adm-denied__inner">
          <h1>Admin access required</h1>
          <p>
            You are signed in as {session.email}, which is a customer account. Staff dashboards need
            an administrator login.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link className="adm-btn adm-btn--primary" to="/account">
              Go to my account
            </Link>
            <button
              type="button"
              className="adm-btn adm-btn--outline"
              onClick={() => {
                signOut()
                navigate('/login?next=/admin', { replace: true })
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const meta = adminRouteMeta(location.pathname)

  return (
    <div className="admin">
      <div className="admin__shell">
        <aside className={`admin__sidebar ${menuOpen ? 'is-open' : ''}`}>
          <div className="admin__brand">
            <img src="/logo-mark.png" alt="" />
            <div>
              <strong>PrathibaLanka</strong>
              <span>Admin console</span>
            </div>
          </div>

          <nav className="admin__nav" aria-label="Admin">
            <span className="admin__nav-label">Operations</span>
            {NAV.slice(0, 3).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}

            <span className="admin__nav-label">Content</span>
            {NAV.slice(3).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}

            <span className="admin__nav-label">Public site</span>
            <Link to="/">View the website</Link>
          </nav>

          <div className="admin__sidebar-foot">
            <div className="admin__user">
              <span title={session.email}>{session.email}</span>
              <button
                type="button"
                className="adm-btn adm-btn--sm adm-btn--outline"
                onClick={() => {
                  signOut()
                  navigate('/', { replace: true })
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="admin__main">
          <header className="admin__topbar">
            <div>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>
            <div className="admin__topbar-actions">
              <Link className="adm-btn adm-btn--outline adm-btn--sm" to="/">
                View website
                <ArrowRight width={15} height={15} />
              </Link>
              <button
                type="button"
                className="admin__menu-toggle"
                aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'}
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? <Close width={18} height={18} /> : <Menu width={18} height={18} />}
              </button>
            </div>
          </header>

          <div className="admin__content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
