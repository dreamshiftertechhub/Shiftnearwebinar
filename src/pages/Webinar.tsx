import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Video, CheckCircle, ArrowRight, Mic, MonitorPlay, Store, Users, Gift, Megaphone } from 'lucide-react'
import { submitWebinarRegistration } from '../lib/registrations'

const PROGRAMME = [
  { time: '6:00 PM', title: 'Welcome & Introductions', text: 'Meet the Dreamshifter team and hear the story behind ShiftNear.' },
  { time: '6:15 PM', title: 'The Problem We’re Solving', text: 'Why local business discovery is broken — and what proximity-first changes.' },
  { time: '6:35 PM', title: 'Platform Walkthrough', text: 'A live demo of ShiftNear from both the customer and vendor side.' },
  { time: '7:00 PM', title: 'Roadmap & Launch Plan', text: 'Where we’re launching first, what’s coming next, and how to get involved.' },
  { time: '7:20 PM', title: 'Q&A with the Team', text: 'Bring your questions — we’ll answer as many as we can live.' },
  { time: '7:45 PM', title: 'Early Access & Next Steps', text: 'How to join the pre-launch cohort as a customer or vendor.' },
]

const WHAT_YOU_GET = [
  { icon: MonitorPlay, title: 'A live product demo', text: 'See ShiftNear in action from both the customer side and the vendor side.' },
  { icon: Store, title: 'How to get found', text: 'Learn how local businesses and freelancers list their services and reach nearby customers.' },
  { icon: Megaphone, title: 'Pitch your business', text: 'Be ready with a short pitch. Selected attendees can present their business to the room.' },
  { icon: Gift, title: 'Q&A and giveaways', text: 'Ask the team your questions live, and take part in community giveaways.' },
]

const SPEAKERS = [
  { initials: 'AE', name: 'Ayinde Emmanuel Olatunde', role: 'Host and lead speaker', text: 'Founder of Dreamshifter Tech Hub, digital product specialist and creator of ShiftNear.' },
  { initials: 'WA', name: 'Woli Arole', role: 'Special guest speaker', text: 'Media personality and entertainer, sharing perspective and motivation for the year ahead.' },
  { initials: 'IF', name: 'Ifeoluwa', role: 'Co-host and moderator', text: 'Guiding the conversation and keeping the session moving, with plenty of room for your questions.' },
]

const FAQ = [
  { q: 'Is it free to attend?', a: 'Yes. Registering for ShiftNear Live is free.' },
  { q: 'When is it and where do I watch?', a: 'Saturday 5 December 2026, from 6:00 PM, online as a live stream. We’ll send the joining link before the event.' },
  { q: 'Do I need to be a vendor to attend?', a: 'No. Customers, vendors, freelancers and business owners are all welcome.' },
  { q: 'Can I pitch my business?', a: 'Yes. Tell us in your registration that you’d like to pitch, and come with a short, clear pitch ready.' },
  { q: 'Do I need to pay to join ShiftNear as a vendor?', a: 'Joining the vendor waitlist is free.' },
]

export function WebinarPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', city: '', role: 'customer', questions: '', consent: false })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.consent) return
    setStatus('loading')
    const { error } = await submitWebinarRegistration({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      role: form.role,
      questions: form.questions,
      consent: form.consent,
    })
    if (error) { setStatus('error'); setErrorMsg(error) }
    else { setStatus('success') }
  }

  return (
    <div className="page-webinar">
      {/* WEBINAR HERO */}
      <section className="webinar-hero">
        <div className="hero-overlay" />
        <div className="page-width webinar-hero-content">
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
            See the platform <em>before it launches</em>.
          </motion.h1>
          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join us for a live walkthrough of ShiftNear, the local business
            discovery platform. Meet the team, see the product, and get your
            questions answered.
          </motion.p>
          <div className="webinar-meta">
            <div className="webinar-meta-item">
              <Calendar size={18} />
              <span>5 December 2026</span>
            </div>
            <div className="webinar-meta-item">
              <Clock size={18} />
              <span>6:00 PM – 8:00 PM</span>
            </div>
            <div className="webinar-meta-item">
              <Video size={18} />
              <span>Online · Live stream</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET + SPEAKERS */}
      <section className="page-section">
        <div className="page-width">
          <p className="eyebrow">Saturday 5 December 2026 · 6:00 PM</p>
          <h2>What you’ll walk away with.</h2>
          <div className="wb-grid">
            {WHAT_YOU_GET.map(({ icon: Icon, title, text }) => (
              <div className="wb-card" key={title}>
                <Icon size={22} />
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div className="wb-audience">
            <strong>Who it’s for:</strong> customers who want trusted help nearby, and vendors, freelancers and small businesses who want to be found by people close to them.
          </div>
        </div>
      </section>

      <section className="page-section wb-alt">
        <div className="page-width">
          <p className="eyebrow">Your host and speakers</p>
          <h2>Who you’ll hear from.</h2>
          <div className="wb-speakers">
            {SPEAKERS.map((sp) => (
              <div className="wb-speaker" key={sp.name}>
                <div className="wb-avatar">{sp.initials}</div>
                <span className="wb-role">{sp.role}</span>
                <h4>{sp.name}</h4>
                <p>{sp.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMME + REGISTRATION */}
      <section className="webinar-body page-section">
        <div className="page-width webinar-body-grid">
          {/* PROGRAMME */}
          <div className="programme">
            <p className="eyebrow">The Programme</p>
            <h2>What we’ll cover.</h2>
            <div className="programme-list">
              {PROGRAMME.map((item, i) => (
                <motion.div
                  key={item.title}
                  className="programme-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div className="programme-time">{item.time}</div>
                  <div className="programme-content">
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* REGISTRATION */}
          <div className="registration" id="register">
            <div className="registration-card">
              {status === 'success' ? (
                <div className="form-success form-success--center">
                  <CheckCircle size={36} />
                  <h3>You’re registered!</h3>
                  <p>We’ll email you the joining link before the webinar. See you there.</p>
                </div>
              ) : (
                <>
                  <div className="registration-header">
                    <Mic size={22} />
                    <h3>Register for ShiftNear Live</h3>
                  </div>
                  <form onSubmit={handleSubmit} className="registration-form">
                    {status === 'error' && <div className="form-error">{errorMsg}</div>}
                    <div className="form-field">
                      <label>Full name *</label>
                      <input type="text" value={form.full_name} onChange={update('full_name')} required className="form-input" />
                    </div>
                    <div className="form-field">
                      <label>Email *</label>
                      <input type="email" value={form.email} onChange={update('email')} required className="form-input" />
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Phone</label>
                        <input type="tel" value={form.phone} onChange={update('phone')} className="form-input" />
                      </div>
                      <div className="form-field">
                        <label>City</label>
                        <input type="text" value={form.city} onChange={update('city')} className="form-input" />
                      </div>
                    </div>
                    <div className="form-field">
                      <label>I am a... *</label>
                      <select value={form.role} onChange={update('role')} required className="form-input">
                        <option value="customer">Customer / User</option>
                        <option value="vendor">Vendor / Business</option>
                        <option value="investor">Investor</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Questions for the team?</label>
                      <textarea value={form.questions} onChange={update('questions')} rows={2} className="form-input" />
                    </div>
                    <label className="consent-check">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                        required
                      />
                      <span>I agree to receive webinar details and ShiftNear updates by email.</span>
                    </label>
                    <button type="submit" className="button button--bronze button--full" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Registering...' : <>Register Now <ArrowRight size={16} /></>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="page-section wb-alt">
        <div className="page-width">
        <div className="wb-faq">
          <p className="eyebrow">Questions</p>
          <h2>Before you register.</h2>
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        </div>
      </section>
    </div>
  )
}
