import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navigate, type Route } from '../lib/router'
import { useAuth } from '../auth'

const NAV: { label: string; route: Route['name']; path: string }[] = [
  { label: 'Home', route: 'home', path: '/' },
  { label: 'ShiftNear Webinar', route: 'webinar', path: '/webinar' },
  { label: 'About ShiftNear', route: 'about', path: '/about' },
  { label: 'For Customers', route: 'customers', path: '/customers' },
  { label: 'For Vendors', route: 'vendors', path: '/vendors' },
  { label: 'Dreamshifter', route: 'dreamshifter', path: '/dreamshifter' },
  { label: 'DSHFT Challenge', route: 'challenge', path: '/challenge' },
  { label: 'Contact', route: 'contact', path: '/contact' },
]

export function SiteHeader({ current }: { current: Route['name'] }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [current])

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }

  return (
    <>
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <a href="/" onClick={go('/')} className="brand brand--shiftnear">
          <img className="logo-light" src="/shiftnear-logo.png" alt="ShiftNear" />
          <img className="logo-dark" src="/shiftnear-logo-dark.png" alt="" aria-hidden="true" />
        </a>
        <nav className="desktop-nav">
          {NAV.map((item) => (
            <a
              key={item.route}
              href={item.path}
              onClick={go(item.path)}
              className={current === item.route ? 'is-active' : ''}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          {profile?.account_type === 'admin' && (
            <a href="/admin" onClick={go('/admin')} className="signin-link">
              Admin
            </a>
          )}
          {!profile && (
            <a href="/login" onClick={go('/login')} className="signin-link">
              Staff Login
            </a>
          )}
          {profile && (
            <button
              className="nav-logout"
              onClick={() => { void signOut().then(() => navigate('/')) }}
              aria-label="Sign out"
            >
              <span className="signin-link">Sign out</span>
            </button>
          )}
          <button
            className="mobile-menu-button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
      {mobileOpen && (
        <div className="mobile-menu">
          {NAV.map((item) => (
            <a key={item.route} href={item.path} onClick={go(item.path)}>
              {item.label}
            </a>
          ))}
          {!profile && (
            <a href="/login" onClick={go('/login')}>Staff Login</a>
          )}
          {profile?.account_type === 'admin' && (
            <a href="/admin" onClick={go('/admin')}>Admin Dashboard</a>
          )}
        </div>
      )}
    </>
  )
}

export function Footer() {
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }
  return (
    <footer className="footer">
      <div className="page-width">
        <div className="footer-grid">
          <div>
            <div className="brand brand--footer brand--shiftnear">
              <img className="logo-light" src="/shiftnear-logo.png" alt="ShiftNear" />
          <img className="logo-dark" src="/shiftnear-logo-dark.png" alt="" aria-hidden="true" />
            </div>
            <p>Discover what’s near you.<br />The local business discovery platform, launching soon.</p>
          </div>
          <div className="footer-links">
            <div>
              <div className="footer-label">Platform</div>
              <a href="/about" onClick={go('/about')}>About ShiftNear</a>
              <a href="/customers" onClick={go('/customers')}>For Customers</a>
              <a href="/vendors" onClick={go('/vendors')}>For Vendors</a>
              <a href="/webinar" onClick={go('/webinar')}>ShiftNear Webinar</a>
            </div>
            <div>
              <div className="footer-label">Organisation</div>
              <a href="/dreamshifter" onClick={go('/dreamshifter')}>Dreamshifter</a>
              <a href="/challenge" onClick={go('/challenge')}>DSHFT Challenge</a>
              <a href="/contact" onClick={go('/contact')}>Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Dreamshifter. All rights reserved.</span>
          <span>ShiftNear is in pre-launch</span>
        </div>
      </div>
    </footer>
  )
}
