import { motion } from 'framer-motion'
import { Rocket, Calendar, Bell } from 'lucide-react'
import { navigate } from '../lib/router'

export function ChallengePage() {
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }

  return (
    <div className="page-challenge">
      {/* COMING SOON HERO */}
      <section className="challenge-hero">
        <div className="challenge-hero-bg" />
        <div className="hero-overlay" />
        <div className="page-width challenge-hero-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="challenge-badge"
          >
            <Rocket size={20} />
            <span>Coming Soon</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            The DSHFT <em>Challenge</em>.
          </motion.h1>
          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            An innovation challenge from Dreamshifter, designed to surface and
            support the next generation of builders. Details are on the way.
          </motion.p>
        </div>
      </section>

      <section className="challenge-body page-section">
        <div className="page-width">
          <div className="challenge-info-grid">
            <motion.div
              className="challenge-info-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Calendar size={26} />
              <h3>When</h3>
              <p>The DSHFT Challenge launches soon. Dates and the full timeline will be announced here first.</p>
            </motion.div>
            <motion.div
              className="challenge-info-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Rocket size={26} />
              <h3>What</h3>
              <p>A challenge for builders, problem-solvers, and entrepreneurs who want to create real impact in their communities.</p>
            </motion.div>
            <motion.div
              className="challenge-info-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Bell size={26} />
              <h3>Stay Notified</h3>
              <p>Sign up for early access on the home page and you’ll be among the first to hear when the challenge opens.</p>
            </motion.div>
          </div>

          <div className="inline-cta">
            <div>
              <h2>This is just the beginning.</h2>
              <p>The DSHFT Challenge is part of Dreamshifter’s mission to support local innovation. Stay close.</p>
            </div>
            <div className="about-actions">
              <a href="/" onClick={go('/')} className="button button--dark">Get Early Access</a>
              <a href="/dreamshifter" onClick={go('/dreamshifter')} className="button button--outline-dark">About Dreamshifter</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
