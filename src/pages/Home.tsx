import { useState } from 'react'
import { ArrowRight, Calendar, Clock, MapPin, Sparkles, Store, Video } from 'lucide-react'
import { navigate } from '../lib/router'
import { submitEarlyAccess } from '../lib/registrations'
import { motion } from 'framer-motion'

const HERO_IMAGE = 'https://images.pexels.com/photos/37862879/pexels-photo-37862879.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600'

export function HomePage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'customer' | 'vendor'>('customer')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    setStatus('loading')
    const { error } = await submitEarlyAccess({ full_name: name, email, role })
    if (error) { setStatus('error'); setErrorMsg(error) }
    else { setStatus('success') }
  }

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }

  return (
    <div className="page-home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-image" style={{ backgroundImage: `url(${HERO_IMAGE})`, opacity: 1 }} />
        <div className="hero-overlay" />
        <div className="hero-content page-width">
          <div className="hero-copy">
            <motion.p
              className="eyebrow eyebrow--light"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Building Lagos’s largest local marketplace
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              See ShiftNear <em>before it launches.</em>
            </motion.h1>
            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover the top-rated local discovery app being built for Lagos. One
              login helps people find trusted vendors nearby, while businesses get
              found without needing a website.
            </motion.p>
            <div className="hero-buttons">
              <a href="/webinar" onClick={go('/webinar')} className="button button--bronze">
                Join the Webinar <ArrowRight size={16} />
              </a>
              <a href="/webinar" onClick={go('/webinar')} className="button button--outline-light">
                View the Programme
              </a>
            </div>
          </div>
          <aside className="hero-card" aria-label="Webinar details">
            <p className="hero-card-tag">Free live webinar</p>
            <h2>Reserve your place</h2>
            <ul>
              <li><Calendar size={18} />5 December 2026</li>
              <li><Clock size={18} />6:00 PM – 8:00 PM</li>
              <li><Video size={18} />Online · Live stream</li>
            </ul>
            <a href="/webinar" onClick={go('/webinar')} className="button button--bronze">
              Register now <ArrowRight size={16} />
            </a>
          </aside>
        </div>
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section className="early-access-section">
        <div className="page-width">
          <div className="early-access-grid">
            <div className="early-access-copy">
              <p className="eyebrow">ShiftNear Live</p>
              <h2>The webinar is your first look at ShiftNear.</h2>
              <p className="section-description">
                See the platform in action, understand what is launching, and bring
                your questions to the team. Reserve your place for the live session.
              </p>
            </div>
            <div className="early-access-form-wrap">
              {status === 'success' ? (
                <div className="form-success">
                  <Sparkles size={32} />
                  <h3>You’re on the list!</h3>
                  <p>We’ll be in touch as soon as ShiftNear launches in your area.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="early-access-form">
                  {status === 'error' && <div className="form-error">{errorMsg}</div>}
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="form-input"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-row form-row--role">
                    <label className={`role-chip ${role === 'customer' ? 'is-active' : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        value="customer"
                        checked={role === 'customer'}
                        onChange={() => setRole('customer')}
                      />
                      <MapPin size={15} /> I’m a Customer
                    </label>
                    <label className={`role-chip ${role === 'vendor' ? 'is-active' : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        value="vendor"
                        checked={role === 'vendor'}
                        onChange={() => setRole('vendor')}
                      />
                      <Store size={15} /> I’m a Vendor
                    </label>
                  </div>
                  <button type="submit" className="button button--dark" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Submitting...' : 'Request Early Access'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="pillars-section">
        <div className="page-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">What ShiftNear Does</p>
              <h2>Three ways we change local discovery.</h2>
            </div>
            <div className="heading-aside">
              <p>One trusted place for Lagos communities to find what they need and for local businesses to be discovered first.</p>
            </div>
          </div>
          <div className="pillars-grid">
            <motion.div
              className="pillar-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="pillar-icon"><MapPin size={24} /></div>
              <h3>Discover Nearby</h3>
              <p>You do not need a website. Let people around you find your business when they need what you offer.</p>
            </motion.div>
            <motion.div
              className="pillar-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="pillar-icon"><Store size={24} /></div>
              <h3>Get Found</h3>
              <p>With one login, find clients waiting for you and the closest vendor for the job you need done.</p>
            </motion.div>
            <motion.div
              className="pillar-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="pillar-icon"><Sparkles size={24} /></div>
              <h3>Build Community</h3>
              <p>Be one of the first 5,000 trusted vendors to get free onboarding and let your community know you are ready.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="cta-strip">
        <div className="page-width cta-strip-inner">
          <div>
            <h2>Be among the first trusted users in Lagos.</h2>
            <p>Join the webinar, see how ShiftNear works, and reserve your place in the first 5,000 free vendor onboardings.</p>
          </div>
          <a href="/webinar" onClick={go('/webinar')} className="button button--bronze button--large">
            Register for the Webinar <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  )
}
