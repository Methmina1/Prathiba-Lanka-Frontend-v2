import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import Reveal from '../ui/Reveal'
import ReviewCallToAction from '../ui/ReviewCallToAction'
import { Star } from '../ui/Icons'

/**
 * The reviews strip on the home page.
 *
 * There is no sample content behind this: if the agency has no reviews yet, the section says so and
 * asks for one, rather than filling the space with invented travellers. Reviews come from
 * /api/reviews, and are written by signed-in customers - ReviewCallToAction is what takes them to
 * the form.
 */
export default function Reviews() {
  const { data: reviews } = useApi(() => api.getReviews())

  if (reviews.length === 0) {
    return (
      <section className="section section--muted" id="reviews">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Traveller reviews</span>
            <h2>What people said afterwards</h2>
            <p className="lede">
              We are new here, so there is nothing to show yet. Reviews are written by signed-in
              customers after a journey, and they appear here unedited.
            </p>
          </div>

          {/* A visitor is pointed at the reviews page rather than at a sign-in form: the home page
              deliberately offers no sign-in link (that lives on /plan), and the reviews page is where
              the rest of the explanation is. */}
          <ReviewCallToAction
            label="Travelled with us? Tell us about it"
            signedOutTo="/reviews"
            signedOutLabel="Read the reviews"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="section section--muted" id="reviews">
      <div className="container">
        <div className="section-head section-head--center">
          <span className="eyebrow">Traveller reviews</span>
          <h2>What people said afterwards</h2>
        </div>

        <div className="grid grid--3">
          {reviews.slice(0, 3).map((review, index) => (
            <Reveal key={review.reviewId} delay={index * 110}>
              <figure className="card review-card">
                <div className="review-card__stars" aria-label={`${review.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star key={value} filled={value <= review.rating} width={16} height={16} />
                  ))}
                </div>
                <blockquote>{review.comment}</blockquote>
                <figcaption>
                  <strong>{review.customerName}</strong>
                  {review.packageTitle && <span>{review.packageTitle}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="section-cta">
          <Link className="btn btn--ghost" to="/reviews">
            Read all reviews
          </Link>
        </div>
      </div>
    </section>
  )
}
