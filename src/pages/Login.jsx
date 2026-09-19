import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const requested = params.get('next')

  const [form, setForm] = useState({ email: '', password: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'sending', message: '' })
    try {
      const login = await signIn(form.email, form.password)
      // Where to land depends on who just signed in: staff belong in the console, customers in their
      // account. Without this an admin signing in from this page landed on /account, which is the
      // customer area and answers an admin token with 403s.
      const landing = requested ?? (login?.role === 'ROLE_ADMIN' ? '/admin' : '/account')
      navigate(landing, { replace: true })
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
        eyebrow="Accounts"
        title="Sign in"
        lede="Customers sign in to request bookings, follow their progress and leave a review. Staff sign in here too, and land in the admin console."
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
