import { useEffect, useState } from 'react'

const KEY = 'shiftnear.splash.seen'
const SHOW_MS = 1900

// App-style intro screen, shown once per browser session.
export function Splash() {
  const [phase, setPhase] = useState<'show' | 'fade' | 'gone'>(() => {
    try {
      return sessionStorage.getItem(KEY) ? 'gone' : 'show'
    } catch {
      return 'show'
    }
  })

  useEffect(() => {
    if (phase === 'gone') return
    try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
    const t1 = window.setTimeout(() => setPhase('fade'), SHOW_MS)
    const t2 = window.setTimeout(() => setPhase('gone'), SHOW_MS + 500)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2) }
  }, [phase === 'gone'])

  if (phase === 'gone') return null
  return (
    <div
      className={`splash${phase === 'fade' ? ' splash--out' : ''}`}
      role="presentation"
      onClick={() => setPhase('gone')}
    >
      <div className="splash-inner">
        <img src="/shiftnear-logo.png" alt="ShiftNear" width={300} />
        <p>Find and Book trusted vendors Near You</p>
      </div>
    </div>
  )
}
