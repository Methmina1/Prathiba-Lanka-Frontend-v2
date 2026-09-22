import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { ArrowRight } from '../ui/Icons'

/**
 * How somebody gets to the review form.
 *
 * The form lives on the account page. Both the home strip and the reviews page used to send people
 * to `/plan`, which holds the enquiry form and the PIN tracker but nothing to write a review in -
 * so a customer who clicked "tell us about it" arrived somewhere they could not do it.
 *
 * Three states, in order: staff cannot review (the form asks for ROLE_CUSTOMER), a signed-in
 * customer goes straight to the form, and a visitor is sent to sign in first, because a review is
 * attributed to an account and there is nowhere to attach an anonymous one.
 *
 * `signedOutTo` is overridable because the home page is not allowed to offer a sign-in link - that
 * lives on /plan - so the strip there points at the reviews page instead, which explains the rest.
 */
export default function ReviewCallToAction({
  label = 'Write a review',
  signedOutTo = '/login?next=/account',
  signedOutLabel = 'Sign in to write a review',
}) {
  const { session, mayBook } = useAuth()

  if (!mayBook) return null

  return (
    <div className="section-cta">
      {session ? (
        <Link className="btn btn--cta btn--sweep" to="/account#review">
          {label}
          <ArrowRight width={15} height={15} />
        </Link>
      ) : (
        <Link className="btn btn--ghost" to={signedOutTo}>
          {signedOutLabel}
          <ArrowRight width={15} height={15} />
        </Link>
      )}
    </div>
  )
}
