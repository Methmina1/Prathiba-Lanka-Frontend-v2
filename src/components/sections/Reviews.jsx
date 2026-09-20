import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { useApi } from '../../hooks/useApi'
import Reveal from '../ui/Reveal'
import { ArrowRight, Star } from '../ui/Icons'

/**
 * The reviews strip on the home page.
 *
 * There is no sample content behind this: if the agency has no reviews yet, the section says so and
 * asks for one, rather than filling the space with invented travellers. Reviews come from
 * /api/reviews, and are written by signed-in customers.
 */
export default function Reviews() {
  const { data: reviews } = useApi(() => api.getReviews())
  const { mayBook } = useAuth()

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

          {mayBook && (
            <div className="section-cta">
              <Link className="btn btn--cta btn--sweep" to="/plan">
                Travelled with us? Tell us about it
                <ArrowRight width={15} height={15} />
              </Link>
            </div>
          )}
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
