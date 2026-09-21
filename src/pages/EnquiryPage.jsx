import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { formatDate } from '../utils/format'
import { ArrowRight } from '../components/ui/Icons'

/**
 * One enquiry, seen by the person who sent it.
 *
 * Reached from the link in the acknowledgement email, and opened by the token in that link rather than
 * by a login - the same trade the booking PIN makes. It shows what they wrote, what the agency answered,
 * and gives them somewhere to write again, which is the half that used to be missing: a general enquiry
 * was a one-way note whose reference nothing accepted.
 *
 * Nothing here is a chat: the agency discusses the details from its own inbox, and the messages on this
 * page are the record of that. So the copy says what actually happens - we answer by email - rather than
 * implying somebody is sitting on the other end of this page.
 */
export default function EnquiryPage() {
  const { token } = useParams()
  const [state, setState] = useState({ status: 'loading', enquiry: null, message: '' })
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState({ kind: 'info', text: '' })

  const load = useCallback(async () => {
    try {
      const enquiry = await api.getEnquiry(token)
      setState({ status: 'ready', enquiry, message: '' })
    } catch (error) {
      setState({
        status: 'error',
        enquiry: null,
        message:
          error.status === 404
            ? 'We could not find that enquiry. The link may have been split across two lines by your email client - try copying the whole address, or send us a fresh message.'
            : `We could not reach our records just now${error.status ? ` (${error.status})` : ''}. Please try again in a moment.`,
      })
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  async function send(event) {
    event.preventDefault()
    setSending(true)
    setNotice({ kind: 'info', text: '' })
    try {
      const enquiry = await api.sendEnquiryMessage(token, draft)
      setState({ status: 'ready', enquiry, message: '' })
      setDraft('')
      setNotice({
        kind: 'sent',
        text: 'Thank you - your message is with us. A consultant replies by email.',
      })
    } catch (error) {
      setNotice({
        kind: 'error',
        text:
          error.status === 400
            ? 'Please write a message before sending.'
            : `Could not send that${error.status ? ` (${error.status})` : ''}. Please try again in a moment.`,
      })
    } finally {
      setSending(false)
    }
  }

  const { status, enquiry, message } = state
  const waiting = enquiry?.awaitingReply

  return (
    <main className="page-enter">
      <section className="section enquiry">
        <div className="container">
          <div className="enquiry__head">
            <span className="eyebrow">Your enquiry</span>
            <h1>{enquiry ? enquiry.subject : 'Your enquiry'}</h1>
            {enquiry && (
              <p className="enquiry__meta">
                Reference <strong>#{enquiry.queryId}</strong>
                {formatDate(enquiry.submittedAt) ? ` · sent ${formatDate(enquiry.submittedAt)}` : ''}
                {enquiry.respondedAt && formatDate(enquiry.respondedAt)
                  ? ` · answered ${formatDate(enquiry.respondedAt)}`
                  : ''}
              </p>
            )}
            {enquiry && (
              <span className={`pill ${waiting ? 'pill--pending' : 'pill--confirmed'}`}>
                {waiting ? 'Waiting for a reply' : 'Answered'}
              </span>
            )}
          </div>

          {status === 'loading' && <p className="notice">Looking up your enquiry…</p>}

          {status === 'error' && (
            <>
              <p className="form-note form-note--error">{message}</p>
              <Link className="link-arrow" to="/contact">
                Send us a message instead
                <ArrowRight width={15} height={15} />
              </Link>
            </>
          )}

          {enquiry && (
            <>
              <article className="card enquiry__card">
                <h2>What you sent</h2>
                <p className="enquiry__sent">{enquiry.message}</p>
              </article>

              <section className="enquiry__thread">
                <h2>{enquiry.messages.length ? 'The conversation' : 'Our answer'}</h2>

                {enquiry.messages.length === 0 ? (
                  <p className="enquiry__waiting">
                    Nothing from us yet. A consultant reads every enquiry and replies by email, usually
                    within one working day. You will also find the answer here.
                  </p>
                ) : (
                  <ol className="thread">
                    {enquiry.messages.map((entry) => (
                      <li
                        key={entry.messageId}
                        className={`thread__item thread__item--${entry.direction.toLowerCase()}`}
                      >
                        <div className="thread__meta">
                          <strong>
                            {entry.direction === 'AGENCY' ? 'Prathibha Lanka Voyages' : entry.authorName}
                          </strong>
                          {formatDate(entry.createdAt) && <span>{formatDate(entry.createdAt)}</span>}
                        </div>
                        <p className="thread__body">
                          {entry.body ?? 'No copy of this message was kept.'}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <form className="card enquiry__form" onSubmit={send}>
                <h2>Write back</h2>
                <p className="plan__hint">
                  Add anything that helps - dates, how many are travelling, a question you forgot. We get
                  this by email straight away, and the answer arrives the same way.
                </p>
                <div className="field">
                  <label htmlFor="enquiry-message">Your message</label>
                  <textarea
                    id="enquiry-message"
                    rows={5}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    required
                    maxLength={5000}
                  />
                </div>
                <button className="btn btn--cta btn--sweep" type="submit" disabled={sending}>
                  {sending ? 'Sending…' : 'Send message'}
                </button>
                {notice.text && <p className={`form-note form-note--${notice.kind}`}>{notice.text}</p>}
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
