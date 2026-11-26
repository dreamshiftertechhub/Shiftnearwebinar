import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, TrendingUp, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { navigate } from '../lib/router'
import { submitVendorInterest } from '../lib/registrations'

const BENEFITS = [
  { icon: TrendingUp, title: 'Get discovered for free', text: 'List your business at no cost and appear to every nearby customer searching for what you sell.' },
  { icon: Users, title: 'Reach your neighbourhood', text: 'Stop competing with global brands for attention. ShiftNear ranks by proximity, so you show up first to the people closest to you.' },
  { icon: Clock, title: 'List in minutes', text: 'No website, no tech skills needed. Add your business, location, and hours — you’re on the map.' },
]

export function VendorsPage() {
  const [form, setForm] = useState({ business_name: '', full_name: '', email: '', phone: '', business_type: '', city: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.business_name || !form.full_name || !form.email) return
    setStatus('loading')
    const { error } = await submitVendorInterest(form)
    if (error) { setStatus('error'); setErrorMsg(error) }
    else { setStatus('success') }
  }

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(path)
  }

  return (
    <div className="page-vendors page-section">
      <div className="page-width">
        <div className="page-intro">
          <p className="eyebrow">For Vendors</p>
          <h1>Your business, <em>on the map</em>.</h1>
          <p className="page-lead">
            ShiftNear gives every local business a fair shot at being found. No
            ads, no algorithms that favour big budgets — just proximity. If you
            serve a neighbourhood, you belong here.
          </p>
        </div>

        <div className="benefits-grid">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              className="benefit-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="benefit-icon"><b.icon size={24} /></div>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </motion.div>
          ))}
        </div>

        {/* ONBOARDING STEPS */}
        <div className="onboarding-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Onboarding</p>
              <h2>Three steps to being discovered.</h2>
            </div>
          </div>
          <div className="onboarding-steps">
            <div className="onboarding-step">
              <span className="onboarding-num">1</span>
              <h4>List your business</h4>
              <p>Add your name, what you offer, and where you are.</p>
            </div>
            <div className="onboarding-step">
              <span className="onboarding-num">2</span>
              <h4>Set your hours</h4>
              <p>Tell customers when you’re open so they know when to come.</p>
            </div>
            <div className="onboarding-step">
              <span className="onboarding-num">3</span>
              <h4>Get found</h4>
              <p>Nearby customers searching for what you offer see you first.</p>
            </div>
          </div>
        </div>

        {/* VENDOR INTEREST FORM */}
        <div className="vendor-form-section" id="interest">
          <div className="vendor-form-inner">
            <div className="vendor-form-copy">
              <p className="eyebrow">Vendor Interest</p>
              <h2>Tell us about your business.</h2>
              <p>
                We’re onboarding vendors ahead of launch. Share your details and our
                team will get you set up and on the map before ShiftNear goes live.
              </p>
              <ul className="check-list">
                <li><CheckCircle size={18} /> Free listing during pre-launch</li>
                <li><CheckCircle size={18} /> Early vendor support and onboarding</li>
                <li><CheckCircle size={18} /> Priority placement at launch</li>
              </ul>
            </div>
            <div className="vendor-form-wrap">
              {status === 'success' ? (
                <div className="form-success">
                  <Store size={32} />
                  <h3>Thank you!</h3>
                  <p>We’ve received your interest. Our team will reach out to onboard your business before launch.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="vendor-form">
                  {status === 'error' && <div className="form-error">{errorMsg}</div>}
                  <div className="form-field">
                    <label>Business name *</label>
                    <input type="text" value={form.business_name} onChange={update('business_name')} required className="form-input" />
                  </div>
                  <div className="form-field">
                    <label>Your name *</label>
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
                    <label>What do you sell / offer?</label>
                    <input type="text" value={form.business_type} onChange={update('business_type')} className="form-input" />
                  </div>
                  <div className="form-field">
                    <label>Anything else?</label>
                    <textarea value={form.message} onChange={update('message')} rows={3} className="form-input" />
                  </div>
                  <button type="submit" className="button button--dark" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Submitting...' : <>Submit Interest <ArrowRight size={16} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="inline-cta">
          <div>
            <h2>Want to see the platform before launch?</h2>
            <p>Join our webinar for a live walkthrough of the vendor experience.</p>
          </div>
          <a href="/webinar" onClick={go('/webinar')} className="button button--bronze">Register for Webinar</a>
        </div>
      </div>
    </div>
  )
}
