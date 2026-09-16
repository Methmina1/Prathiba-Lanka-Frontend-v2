import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { fallbackReviews } from '../data/fallback'
import { useApi } from '../hooks/useApi'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import { ArrowRight, Star } from '../components/ui/Icons'
import { formatDate } from '../utils/format'

export default function ReviewsPage() {
  const { data: reviews, status } = useApi(() => api.getReviews(), fallbackReviews)

  const average =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + (Number(review.rating) || 0), 0) / reviews.length
      : 0

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => Math.round(Number(review.rating)) === star).length,
  }))

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="Traveller reviews"
        title="What people said afterwards"
        lede="Unedited notes from travellers who have been out with us. Reviews are written by signed-in customers, one per journey."
        crumbs={[{ label: 'Reviews' }]}
        scenery="safari"
      />

      <section className="section">
        <div className="container">
          {status === 'fallback' && (
            <p className="notice">
              Sample reviews, shown while the review table is empty. Real ones arrive from
              <code> /api/reviews</code>.
            </p>
          )}

          {reviews.length > 0 && (
            <Reveal className="rating-summary card">
              <div className="rating-summary__score">
                <strong>{average.toFixed(1)}</strong>
                <div className="review-card__stars" aria-label={`${average.toFixed(1)} out of 5`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star key={value} filled={value <= Math.round(average)} width={16} height={16} />
                  ))}
                </div>
                <span>
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>

              <ul className="rating-summary__bars">
                {distribution.map((row) => (
                  <li key={row.star}>
                    <span className="rating-summary__label">{row.star}★</span>
                    <span className="rating-summary__track">
                      <span
                        className="rating-summary__fill"
                        style={{ width: `${reviews.length ? (row.count / reviews.length) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="rating-summary__count">{row.count}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <div className="grid grid--3">
            {reviews.map((review, index) => (
              <Reveal key={review.reviewId} delay={index * 80}>
                <figure className="card review-card">
                  <div className="review-card__stars" aria-label={`${review.rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star key={value} filled={value <= review.rating} width={16} height={16} />
                    ))}
                  </div>
                  <blockquote>{review.comment}</blockquote>
                  <figcaption>
                    <strong>{review.customerName}</strong>
                    <span>
                      {review.packageTitle ?? 'General review'}
                      {review.createdAt ? ` · ${formatDate(review.createdAt)}` : ''}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="empty-state">
              <h3>No reviews yet</h3>
              <p>Be the first to write one after your journey.</p>
            </div>
          )}

          <div className="section-cta">
            <Link className="btn btn--cta btn--sweep" to="/plan">
              Travelled with us? Tell us about it
              <ArrowRight width={15} height={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
