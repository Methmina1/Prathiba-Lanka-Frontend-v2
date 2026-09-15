import { useState } from 'react'
import { api } from '../../api/client'

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' }

/** Public enquiry form -> POST /api/contact */
export default function EnquiryForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [state, setState] = useState({ status: 'idle', message: '' })

  const update = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'sending', message: '' })
    try {
      await api.submitQuery(form)
      setForm(EMPTY_FORM)
      setState({
        status: 'sent',
        message: 'Thank you - your enquiry is in. A consultant replies within one working day.',
      })
    } catch (error) {
      setState({
        status: 'error',
        message:
          error.status === 400
            ? 'Please check the form: name, a valid email, a subject and a message are required.'
            : `Could not send the enquiry${error.status ? ` (${error.status})` : ''}. Is the backend running?`,
      })
    }
  }

  return (
    <form className="card plan__form" onSubmit={submit}>
      <h3>Request a journey</h3>
      <p className="plan__hint">Tell us roughly when, and what you would like to see.</p>

      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" value={form.name} onChange={update('name')} required maxLength={100} />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={form.email} onChange={update('email')} required />
      </div>

      <div className="field">
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          value={form.subject}
          onChange={update('subject')}
          required
          maxLength={200}
          placeholder="Two weeks in August, family of four"
        />
      </div>

      <div className="field">
        <label htmlFor="message">What would you like to see?</label>
        <textarea id="message" rows={5} value={form.message} onChange={update('message')} required />
      </div>

      <button className="btn btn--cta btn--sweep btn--block" type="submit" disabled={state.status === 'sending'}>
        {state.status === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>

      {state.message && <p className={`form-note form-note--${state.status}`}>{state.message}</p>}
      <p className="plan__api">
        Posts to <code>/api/contact</code> on the PrathibaLanka backend.
      </p>
    </form>
  )
}
