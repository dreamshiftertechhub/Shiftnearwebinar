import { motion } from 'framer-motion'
import { MapPin, Search, Navigation, Clock, Filter, Star } from 'lucide-react'
import { navigate } from '../lib/router'

const STEPS = [
  { icon: Search, title: 'Search what you need', text: 'Type what you’re looking for — a pharmacy, a tailor, a market stall — and ShiftNear shows you what’s nearby, not what’s paid to be on top.' },
  { icon: Navigation, title: 'See it on the map', text: 'Results appear on a live neighbourhood map. Distance, hours, and directions are right there. No digging through pages.' },
  { icon: Filter, title: 'Filter for your needs', text: 'Open now, walking distance, rating, category. Narrow results to exactly what fits your moment.' },
  { icon: Star, title: 'Support your locals', text: 'Every visit, rating, and review helps your favourite local businesses grow and get found by more neighbours.' },
]

export function CustomersPage() {
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }

  return (
    <div className="page-customers page-section">
      <div className="page-width">
        <div className="page-intro">
          <p className="eyebrow">For Customers</p>
          <h1>Find what you need, <em>right around the corner</em>.</h1>
          <p className="page-lead">
            ShiftNear puts the neighbourhood in your pocket. Whether it’s a late-night
            pharmacy, a market vendor with the best produce, or a tailor two streets
            over — if it’s near you, it’s on the map.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              className="step-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="step-number">0{i + 1}</div>
              <div className="step-icon"><step.icon size={22} /></div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="feature-banner">
          <div className="feature-banner-content">
            <MapPin size={28} />
            <h2>Built for walking distance.</h2>
            <p>
              Most discovery platforms are built for a global audience. ShiftNear is
              built for the three blocks around you. That means faster finds, less
              scrolling, and more time spent actually walking to the place.
            </p>
          </div>
        </div>

        <div className="inline-cta">
          <div>
            <h2>Want to be first to try it?</h2>
            <p>Request early access and we’ll notify you when ShiftNear launches in your area.</p>
          </div>
          <a href="/" onClick={go('/')} className="button button--dark">Request Early Access</a>
        </div>
      </div>
    </div>
  )
}
