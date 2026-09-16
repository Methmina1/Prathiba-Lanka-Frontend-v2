import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { fallbackReviews } from '../../data/fallback'
import { useApi } from '../../hooks/useApi'
import Reveal from '../ui/Reveal'
import { Star } from '../ui/Icons'

export default function Reviews() {
  const { data: reviews, status } = useApi(() => api.getReviews(), fallbackReviews)

  return (
    <section className="section section--muted" id="reviews">
      <div className="container">
        <div className="section-head section-head--center">
          <span className="eyebrow">Traveller reviews</span>
          <h2>What people said afterwards</h2>
          {status === 'fallback' && (
            <p className="notice">
              Sample reviews, shown while the review table is empty. Real ones arrive from
              <code> /api/reviews</code>.
            </p>
          )}
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
