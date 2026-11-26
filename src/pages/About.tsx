import { motion } from 'framer-motion'
import { Eye, Target, Zap } from 'lucide-react'
import { navigate } from '../lib/router'

export function AboutPage() {
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }

  return (
    <div className="page-about page-section">
      <div className="page-width">
        <div className="page-intro">
          <p className="eyebrow">About ShiftNear</p>
          <h1>A new way to find <em>what’s near</em>.</h1>
          <p className="page-lead">
            ShiftNear is a local business discovery platform built on a simple idea:
            the shop, service, or vendor you need is probably closer than you think.
            We’re mapping the neighbourhood so that discovery happens by proximity,
            not by who pays the most for ads.
          </p>
        </div>

        <div className="vision-grid">
          <motion.div
            className="vision-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="vision-icon"><Eye size={26} /></div>
            <h3>The Vision</h3>
            <p>
              A world where every local business is discoverable, and every person
              can find what they need within reach — turning neighbourhoods into
              connected, thriving economies.
            </p>
          </motion.div>
          <motion.div
            className="vision-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="vision-icon"><Target size={26} /></div>
            <h3>The Problem</h3>
            <p>
              Search engines reward paid placement, not proximity. Small businesses
              are invisible online, and people walk past what they need every day
              without knowing it’s there.
            </p>
          </motion.div>
          <motion.div
            className="vision-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="vision-icon"><Zap size={26} /></div>
            <h3>The Solution</h3>
            <p>
              ShiftNear indexes businesses by location so discovery is geographic
              first. Vendors get a free listing; customers get a live map of what’s
              around them — filtered, relevant, and walking-distance real.
            </p>
          </motion.div>
        </div>

        <div className="about-story">
          <div className="about-story-copy">
            <p className="eyebrow">Why Now</p>
            <h2>Local commerce is the backbone of every economy.</h2>
            <p>
              Yet the tools built to serve it are designed for global brands with
              marketing budgets. ShiftNear flips the model: proximity is the ranking
              signal, and every business — no matter how small — gets a fair chance
              to be found by the people walking past.
            </p>
            <p>
              We’re starting in pre-launch, building with real communities, and
              shaping the platform around what neighbourhoods actually need. That’s
              why your early input matters.
            </p>
            <div className="about-actions">
              <a href="/webinar" onClick={go('/webinar')} className="button button--dark">See it at the Webinar</a>
              <a href="/contact" onClick={go('/contact')} className="button button--outline-dark">Get in Touch</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
