import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/account'

  const [form, setForm] = useState({ email: '', password: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'sending', message: '' })
    try {
      await signIn(form.email, form.password)
      navigate(next, { replace: true })
    } catch (error) {
      setState({
        status: 'error',
        message:
          error.status === 401
            ? 'That email and password combination did not match an account.'
            : error.status === 400
              ? 'Please enter a valid email address and your password.'
              : `Could not sign you in${error.status ? ` (${error.status})` : ''}. Is the backend running?`,
      })
    }
  }

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="Customers"
        title="Sign in"
        lede="Sign in to request bookings, follow their progress and leave a review afterwards."
        crumbs={[{ label: 'Sign in' }]}
      />

      <section className="section">
        <div className="container narrow">
          <form className="card auth-card" onSubmit={submit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={update('password')}
                required
              />
            </div>

            <button className="btn btn--cta btn--sweep btn--block" type="submit" disabled={state.status === 'sending'}>
              {state.status === 'sending' ? 'Signing in…' : 'Sign in'}
            </button>

            {state.message && <p className="form-note form-note--error">{state.message}</p>}

            <p className="auth-card__switch">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
