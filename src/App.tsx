import { useEffect, useState } from 'react'
import { SiteHeader, Footer } from './components/Layout'
import { parseRoute, type Route } from './lib/router'
import { HomePage } from './pages/Home'
import { AboutPage } from './pages/About'
import { CustomersPage } from './pages/Customers'
import { VendorsPage } from './pages/Vendors'
import { WebinarPage } from './pages/Webinar'
import { DreamshifterPage } from './pages/Dreamshifter'
import { ChallengePage } from './pages/Challenge'
import { ContactPage } from './pages/Contact'
import { AdminPage } from './pages/Admin'
import { AuthPage } from './pages/Auth'
import { Splash } from './components/Splash'

export default function App() {
  const [route, setRoute] = useState<Route>(parseRoute(window.location.pathname))

  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute(window.location.pathname))
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const renderPage = () => {
    switch (route.name) {
      case 'home': return <HomePage />
      case 'about': return <AboutPage />
      case 'customers': return <CustomersPage />
      case 'vendors': return <VendorsPage />
      case 'webinar': return <WebinarPage />
      case 'dreamshifter': return <DreamshifterPage />
      case 'challenge': return <ChallengePage />
      case 'contact': return <ContactPage />
      case 'admin': return <AdminPage />
      case 'login': return <AuthPage mode="login" />
      case 'signup': return <AuthPage mode="signup" />
      default: return <HomePage />
    }
  }

  const showChrome = route.name !== 'login' && route.name !== 'signup'

  return (
    <>
      <Splash />
      {showChrome && <SiteHeader current={route.name} />}
      <main>{renderPage()}</main>
      {showChrome && <Footer />}
    </>
  )
}
