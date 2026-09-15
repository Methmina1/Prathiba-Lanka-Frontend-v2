import { api } from '../../api/client'
import { fallbackJournal } from '../../data/fallback'
import { useApi } from '../../hooks/useApi'
import Reveal from '../ui/Reveal'
import Scenery from '../ui/Scenery'
import { ArrowRight } from '../ui/Icons'

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const FALLBACK_SCENERY = ['coast', 'temple', 'tea', 'safari', 'train', 'hills']

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
              <article className="card journal-card">
              <div className="journal-card__media">
                <Scenery variant={post.scenery ?? FALLBACK_SCENERY[index % 6]} ratio="16 / 10" />
              </div>
              <div className="journal-card__body">
                <span className="journal-card__date">{formatDate(post.publishedAt) ?? 'Draft'}</span>
                <h3>{post.title}</h3>
                {post.description && <p className="journal-card__text">{post.description}</p>}
                <a className="link-arrow" href="#journal">
                  Read the story
                  <ArrowRight width={15} height={15} />
                </a>
              </div>
            </article>
            </Reveal>
          ))}
        </div>

        <div className="section-cta">
          <a className="btn btn--ghost" href="#journal">
            All stories
          </a>
        </div>
      </div>
    </section>
  )
}
