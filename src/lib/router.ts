export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'customers' }
  | { name: 'vendors' }
  | { name: 'webinar' }
  | { name: 'dreamshifter' }
  | { name: 'challenge' }
  | { name: 'contact' }
  | { name: 'admin' }
  | { name: 'login' }
  | { name: 'signup' }

export function parseRoute(path: string): Route {
  const clean = path.split('?')[0].replace(/\/+$/, '').replace(/^\/+/, '')
  switch (clean) {
    case 'about': return { name: 'about' }
    case 'customers': return { name: 'customers' }
    case 'vendors': return { name: 'vendors' }
    case 'webinar': return { name: 'webinar' }
    case 'dreamshifter': return { name: 'dreamshifter' }
    case 'challenge': return { name: 'challenge' }
    case 'contact': return { name: 'contact' }
    case 'admin': return { name: 'admin' }
    case 'login': return { name: 'login' }
    case 'signup': return { name: 'signup' }
    default: return { name: 'home' }
  }
}

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}
