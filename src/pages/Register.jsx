import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import { useAuth } from '../auth/AuthContext'

const EMPTY = { fullName: '', email: '', phone: '', password: '' }

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [state, setState] = useState({ status: 'idle', message: '' })

  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'sending', message: '' })
    try {
      await signUp(form)
      navigate('/account', { replace: true })
    } catch (error) {
      setState({
        status: 'error',
        message:
          error.status === 400
            ? error.payload?.message ?? 'Please check the form - the password needs at least 8 characters.'
            : `Could not create the account${error.status ? ` (${error.status})` : ''}. Is the backend running?`,
      })
    }
  }

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="Customers"
        title="Create an account"
        lede="An account lets you request bookings, follow their progress with a PIN and leave a review afterwards."
        crumbs={[{ label: 'Create an account' }]}
      />

      <section className="section">
        <div className="container narrow">
          <form className="card auth-card" onSubmit={submit}>
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" value={form.fullName} onChange={update('fullName')} required maxLength={100} />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} required />
            </div>

            <div className="field">
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" value={form.phone} onChange={update('phone')} maxLength={20} />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
                required
                minLength={8}
              />
              <span className="field__hint">At least 8 characters.</span>
            </div>

            <button className="btn btn--cta btn--sweep btn--block" type="submit" disabled={state.status === 'sending'}>
              {state.status === 'sending' ? 'Creating…' : 'Create account'}
            </button>

            {state.message && <p className="form-note form-note--error">{state.message}</p>}

            <p className="auth-card__switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
