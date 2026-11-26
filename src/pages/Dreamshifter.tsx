import { motion } from 'framer-motion'
import { Rocket, Globe, Heart, Compass } from 'lucide-react'
import { navigate } from '../lib/router'

const INITIATIVES = [
  { icon: Compass, title: 'ShiftNear', text: 'A local business discovery platform that puts proximity first, giving every neighbourhood business a fair chance to be found.' },
  { icon: Rocket, title: 'DSHFT Challenge', text: 'An upcoming innovation challenge designed to surface and support the next wave of builders and problem-solvers.' },
  { icon: Globe, title: 'Community Programs', text: 'Workshops, mentorship, and resources that help local entrepreneurs build sustainable, discoverable businesses.' },
]

export function DreamshifterPage() {
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }

  return (
    <div className="page-dreamshifter page-section">
      <div className="page-width">
        <div className="page-intro">
          <p className="eyebrow">About Dreamshifter</p>
          <h1>The organisation <em>behind</em> ShiftNear.</h1>
          <p className="page-lead">
            Dreamshifter is the parent organisation building ShiftNear and a wider
            ecosystem of tools, challenges, and programs designed to uplift local
            commerce and the people who power it.
          </p>
        </div>

        <div className="mission-block">
          <div className="mission-content">
            <Heart size={28} />
            <h2>Our Mission</h2>
            <p>
              To build technology and run initiatives that shift the balance toward
              local economies — making sure the smallest business has the same
              discoverability as the biggest brand, and that communities have the
              tools to thrive together.
            </p>
          </div>
        </div>

        <div className="section-heading" style={{ marginTop: '80px' }}>
          <div>
            <p className="eyebrow">Our Initiatives</p>
            <h2>What Dreamshifter is building.</h2>
          </div>
        </div>

        <div className="initiatives-grid">
          {INITIATIVES.map((item, i) => (
            <motion.div
              key={item.title}
              className="initiative-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="initiative-icon"><item.icon size={24} /></div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="about-story" style={{ marginTop: '80px' }}>
          <div className="about-story-copy">
            <p className="eyebrow">Our Approach</p>
            <h2>Build with communities, not for them.</h2>
            <p>
              Every Dreamshifter product is shaped by the people who’ll use it. We
              work with vendors, customers, and local leaders to understand what a
              neighbourhood actually needs — then build tools that fit. ShiftNear is
              the first product to come out of that approach, and it won’t be the last.
            </p>
            <div className="about-actions">
              <a href="/challenge" onClick={go('/challenge')} className="button button--dark">See the DSHFT Challenge</a>
              <a href="/contact" onClick={go('/contact')} className="button button--outline-dark">Partner With Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
