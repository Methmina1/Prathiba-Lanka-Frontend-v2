import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { fallbackJournal } from '../data/fallback'
import { useApi } from '../hooks/useApi'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import Scenery from '../components/ui/Scenery'
import { ArrowRight } from '../components/ui/Icons'
import { formatDate } from '../utils/format'

const SCENERY = ['coast', 'temple', 'tea', 'safari', 'train', 'hills']

export default function JournalPage() {
  const { data: posts, status } = useApi(() => api.getPublishedJournal(), fallbackJournal)
  const [featured, ...rest] = posts

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="The journal"
        title="Stories from the island"
        lede="Seasonal advice, small histories and the sort of detail that only helps once you are here."
        crumbs={[{ label: 'Journal' }]}
        scenery="hills"
      />

      <section className="section">
        <div className="container">
          {status === 'fallback' && (
            <p className="notice">
              Showing sample stories. Published posts load from
              <code> /api/journal/published</code>.
            </p>
          )}

          {featured && (
            <Reveal>
              <Link className="feature-post" to={`/journal/${featured.journalId}`}>
                <div className="feature-post__media">
                  <Scenery variant={featured.scenery ?? 'coast'} ratio="16 / 10" />
                </div>
                <div className="feature-post__body">
                  <span className="journal-card__date">
                    {formatDate(featured.publishedAt) ?? 'Recently published'}
                  </span>
                  <h2>{featured.title}</h2>
                  {featured.description && <p className="lede">{featured.description}</p>}
                  <span className="link-arrow">
                    Read the story
                    <ArrowRight width={15} height={15} />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {rest.length > 0 && (
            <div className="grid grid--3 journal-grid">
              {rest.map((post, index) => (
                <Reveal key={post.journalId} delay={index * 90}>
                  <Link className="card journal-card" to={`/journal/${post.journalId}`}>
                    <div className="journal-card__media">
                      <Scenery
                        variant={post.scenery ?? SCENERY[index % SCENERY.length]}
                        ratio="16 / 10"
                      />
                    </div>
                    <div className="journal-card__body">
                      <span className="journal-card__date">
                        {formatDate(post.publishedAt) ?? 'Recently published'}
                      </span>
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
          )}

          {posts.length === 0 && (
            <div className="empty-state">
              <h3>No stories published yet</h3>
              <p>Drafts appear here once an editor publishes them.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
