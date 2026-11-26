import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '../auth'
import { navigate } from '../lib/router'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (mode === 'login') {
      const result = await signIn(email, password)
      if (result.error) { setError(result.error); setLoading(false) }
      else navigate('/admin')
    } else {
      const result = await signUp({ fullName, email, phone: '', password, accountType: 'buyer' })
      if (result.error) { setError(result.error); setLoading(false) }
      else { setSuccess(true); setLoading(false) }
    }
  }

  return (
    <div className="page-auth page-section">
      <div className="page-width">
        <div className="auth-card">
          {success ? (
            <div className="auth-success">
              <CheckCircle size={36} />
              <p className="eyebrow">Account created</p>
              <h1>You're all set.</h1>
              <p className="auth-subtitle">Your ShiftNear admin account is ready. Sign in with your new email and password to open the dashboard.</p>
              <button className="button button--primary button--full" onClick={() => navigate('/login')}>Continue to Sign In</button>
            </div>
          ) : (
            <>
              <p className="eyebrow">Staff Access</p>
              <h1>{mode === 'login' ? 'Sign in' : 'Create admin account'}</h1>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to access the ShiftNear admin dashboard.'
                  : 'Create the first ShiftNear admin account to manage submissions.'}
              </p>
              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="form-error">{error}</div>}
                {mode === 'signup' && (
                  <div className="form-field">
                    <label>Full name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="form-input" />
                  </div>
                )}
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="form-input" />
                </div>
                <button type="submit" className="button button--primary button--full" disabled={loading}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Admin Account'}
                </button>
              </form>
              <p className="auth-switch">
                {mode === 'login' ? (
                  <>Need an account? <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup') }}>Create one</a></>
                ) : (
                  <>Already have one? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Sign in</a></>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
