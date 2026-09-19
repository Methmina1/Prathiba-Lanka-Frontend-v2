import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { fallbackJournal } from '../../data/fallback'
import { useApi } from '../../hooks/useApi'
import Reveal from '../ui/Reveal'
import CoverImage from '../ui/CoverImage'
import PHOTOS from '../../data/photos'
import { ArrowRight } from '../ui/Icons'

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Journal() {
  const { data: posts } = useApi(() => api.getPublishedJournal(), fallbackJournal)

  return (
    <section className="section" id="journal">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">The journal</span>
          <h2>Stories from the island</h2>
          <p className="lede">
            Seasonal advice, small histories and the sort of detail that only helps once you are here.
          </p>
        </div>

        <div className="grid grid--3">
          {posts.slice(0, 3).map((post, index) => (
            <Reveal key={post.journalId} delay={index * 110}>
              <Link className="card journal-card" to={`/journal/${post.journalId}`}>
              <div className="journal-card__media">
                <CoverImage
                  src={post.coverImageUrl}
                  fallback={PHOTOS.journalFallback[index % PHOTOS.journalFallback.length]}
                  alt={post.title}
                />
              </div>
              <div className="journal-card__body">
                <span className="journal-card__date">{formatDate(post.publishedAt) ?? 'Draft'}</span>
                <h3>{post.title}</h3>
                {post.description && <p className="journal-card__text">{post.description}</p>}
                <span className="link-arrow">
                  Read the story
                  <ArrowRight width={15} height={15} />
                </span>
              </div>
            </Link>
            </Reveal>
          ))}
        </div>

        <div className="section-cta">
          <Link className="btn btn--ghost" to="/journal">
            All stories
          </Link>
        </div>
      </div>
    </section>
  )
}
