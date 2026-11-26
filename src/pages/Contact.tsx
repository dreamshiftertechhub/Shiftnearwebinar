import { useState } from 'react'
import { Mail, Phone, MapPin, ArrowRight, MessageSquare } from 'lucide-react'
import { submitContactEnquiry } from '../lib/registrations'

export function ContactPage() {
  const [form, setForm] = useState({ full_name: '', email: '', subject: 'General', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.message) return
    setStatus('loading')
    const { error } = await submitContactEnquiry(form)
    if (error) { setStatus('error'); setErrorMsg(error) }
    else { setStatus('success') }
  }

  return (
    <div className="page-contact page-section">
      <div className="page-width">
        <div className="page-intro">
          <p className="eyebrow">Contact</p>
          <h1>Let’s <em>talk</em>.</h1>
          <p className="page-lead">
            Questions, partnerships, press, or just curious about ShiftNear? We’d
            love to hear from you. Use the form below or reach us directly.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-info-item">
              <Mail size={20} />
              <div>
                <h4>Email</h4>
                <p>hello@shiftnear.app</p>
              </div>
            </div>
            <div className="contact-info-item">
              <Phone size={20} />
              <div>
                <h4>Phone</h4>
                <p>+234 (0) 800 SHIFTNEAR</p>
              </div>
            </div>
            <div className="contact-info-item">
              <MapPin size={20} />
              <div>
                <h4>Location</h4>
                <p>Built for neighbourhoods everywhere</p>
              </div>
            </div>
            <div className="contact-info-item">
              <MessageSquare size={20} />
              <div>
                <h4>Partnerships</h4>
                <p>partners@shiftnear.app</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrap">
            {status === 'success' ? (
              <div className="form-success">
                <MessageSquare size={32} />
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We’ll get back to you as soon as we can.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                {status === 'error' && <div className="form-error">{errorMsg}</div>}
                <div className="form-field">
                  <label>Your name *</label>
                  <input type="text" value={form.full_name} onChange={update('full_name')} required className="form-input" />
                </div>
                <div className="form-field">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={update('email')} required className="form-input" />
                </div>
                <div className="form-field">
                  <label>Subject</label>
                  <select value={form.subject} onChange={update('subject')} className="form-input">
                    <option value="General">General Enquiry</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Press">Press / Media</option>
                    <option value="Vendor">Vendor Question</option>
                    <option value="Investor">Investor Enquiry</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Message *</label>
                  <textarea value={form.message} onChange={update('message')} rows={5} required className="form-input" />
                </div>
                <button type="submit" className="button button--dark" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending...' : <>Send Message <ArrowRight size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
