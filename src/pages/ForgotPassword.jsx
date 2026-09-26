import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import { api } from '../api/client'

const RESET_EMPTY = { code: '', newPassword: '', confirmPassword: '' }

/**
 * Admin accounts only - customers have no password-reset flow yet. Two steps in one page rather
 * than two routes, because the second step needs nothing the first didn't already collect (the
 * email), and a page reload between them would lose it.
 */
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('request') // 'request' | 'reset'
  const [email, setEmail] = useState('')

  const [requestState, setRequestState] = useState({ status: 'idle', message: '' })
  const [reset, setReset] = useState(RESET_EMPTY)
  const [resetState, setResetState] = useState({ status: 'idle', message: '' })

  async function submitRequest(event) {
    event.preventDefault()
    setRequestState({ status: 'sending', message: '' })
    try {
      // The backend checks the address against the admin table and answers 401 when there is no
      // account behind it. That is the one case worth naming - anything else is a failure of the
      // send itself, and the backend's sentence is the one to show.
      const response = await api.forgotPassword(email)
      setRequestState({
        status: 'sent',
        message:
          response?.message ??
          'If that address belongs to an admin account, a code is on its way. It is good for 10 minutes.',
      })
      setStep('reset')
    } catch (error) {
      setRequestState({
        status: 'error',
        message:
          error.status === 401
            ? 'That address is not an admin account. Check it, or ask another admin to reset it for you.'
            : error.payload?.message ??
              `Could not send the code${error.status ? ` (${error.status})` : ''}.`,
      })
    }
  }

  async function submitReset(event) {
    event.preventDefault()

    if (reset.newPassword !== reset.confirmPassword) {
      setResetState({ status: 'error', message: 'The new password and its confirmation do not match.' })
      return
    }

    setResetState({ status: 'sending', message: '' })
    try {
      await api.resetPassword({ email, code: reset.code.trim(), newPassword: reset.newPassword })
      navigate('/login', { replace: true })
    } catch (error) {
      setResetState({
        status: 'error',
        message:
          error.payload?.message ?? `Could not reset the password${error.status ? ` (${error.status})` : ''}.`,
      })
    }
  }

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="Accounts"
        title="Forgotten your password?"
        lede="This is for admin accounts. Enter the address you sign in with and we will email a one-time code."
        crumbs={[{ label: 'Sign in', to: '/login' }, { label: 'Forgot password' }]}
      />

      <section className="section">
        <div className="container narrow">
          {step === 'request' ? (
            <form className="card auth-card" onSubmit={submitRequest}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <button
                className="btn btn--cta btn--sweep btn--block"
                type="submit"
                disabled={requestState.status === 'sending'}
              >
                {requestState.status === 'sending' ? 'Sending…' : 'Send code'}
              </button>

              {requestState.message && (
                <p className={`form-note form-note--${requestState.status}`}>{requestState.message}</p>
              )}

              <p className="auth-card__switch">
                Remembered it? <Link to="/login">Back to sign in</Link>
              </p>
            </form>
          ) : (
            <form className="card auth-card" onSubmit={submitReset}>
              <p className="form-note form-note--sent">{requestState.message}</p>

              <div className="field">
                <label htmlFor="code">Code</label>
                <input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={reset.code}
                  onChange={(event) => setReset((value) => ({ ...value, code: event.target.value }))}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  value={reset.newPassword}
                  onChange={(event) => setReset((value) => ({ ...value, newPassword: event.target.value }))}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  value={reset.confirmPassword}
                  onChange={(event) => setReset((value) => ({ ...value, confirmPassword: event.target.value }))}
                  required
                />
              </div>

              <button
                className="btn btn--cta btn--sweep btn--block"
                type="submit"
                disabled={resetState.status === 'sending'}
              >
                {resetState.status === 'sending' ? 'Resetting…' : 'Reset password'}
              </button>

              {resetState.message && (
                <p className={`form-note form-note--${resetState.status}`}>{resetState.message}</p>
              )}

              <p className="auth-card__switch">
                Didn&apos;t get a code?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStep('request')
                    setResetState({ status: 'idle', message: '' })
                    setRequestState({ status: 'idle', message: '' })
                  }}
                >
                  Send it again
                </button>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}