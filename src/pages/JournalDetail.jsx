import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { fallbackJournal } from '../data/fallback'
import { useAuth } from '../auth/AuthContext'
import { useResource } from '../hooks/useResource'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import CoverImage from '../components/ui/CoverImage'
import PHOTOS from '../data/photos'
import { ArrowRight } from '../components/ui/Icons'
import { formatDate, toParagraphs } from '../utils/format'

const SCENERY = ['coast', 'temple', 'tea', 'safari', 'train', 'hills']

export default function JournalDetail() {
  const { id } = useParams()
  const { mayBook } = useAuth()
  const { status, data } = useResource(() => api.getJournalPost(id), [id])

  const sample = fallbackJournal.find((post) => String(post.journalId) === String(id))
  const post = status === 'ready' ? data : sample
  const isSample = status !== 'ready' && Boolean(sample)

  const others = fallbackJournal
    .filter((entry) => String(entry.journalId) !== String(id))
    .slice(0, 3)

  if (!post) {
    return (
      <main className="page-enter">
        <PageHero
          eyebrow="Not found"
          title="That story is not here"
          lede="It may have been unpublished, or the link may be wrong."
          crumbs={[{ label: 'Journal', to: '/journal' }, { label: 'Not found' }]}
        />
        <section className="section">
          <div className="container empty-state">
            <Link className="btn btn--cta btn--sweep" to="/journal">
              Back to the journal
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const paragraphs = toParagraphs(post.content) 
  const scenery = post.scenery ?? SCENERY[Number(post.journalId) % SCENERY.length] ?? 'hills'

  return (
    <main className="page-enter">
      <PageHero
        eyebrow={formatDate(post.publishedAt) ?? 'The journal'}
        title={post.title}
        lede={post.description}
        crumbs={[{ label: 'Journal', to: '/journal' }, { label: post.title }]}
        scenery={scenery}
      />

      <section className="section">
        <div className="container post">
          {isSample && (
            <p className="notice">
              This is one of the sample stories - the backend has no published post with this id.
            </p>
          )}

          <Reveal>
            <div className="post__cover">
              <CoverImage src={post.coverImageUrl} fallback={PHOTOS.journalFallback[0]} alt={post.title} />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <article className="prose">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p>{post.description}</p>
              )}

              <p className="prose__signoff">
                Written from the road by the PrathibhaLanka team. If you would like this turned into
                days on the ground, the enquiry form is the fastest way.
              </p>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <div className="post__footer">
              {mayBook && (
                <Link className="btn btn--cta btn--sweep" to="/plan">
                  Plan a journey around this
                  <ArrowRight width={15} height={15} />
                </Link>
              )}
              <Link className="link-arrow" to="/journal">
                All stories
              </Link>
            </div>
          </Reveal>

          {others.length > 0 && (
            <Reveal delay={140}>
              <h3 className="detail__subhead">More from the journal</h3>
              <div className="grid grid--3">
                {others.map((entry, index) => (
                  <Link className="card journal-card" to={`/journal/${entry.journalId}`} key={entry.journalId}>
                    <div className="journal-card__media">
                      <CoverImage
                        src={entry.coverImageUrl}
                        fallback={PHOTOS.journalFallback[index % PHOTOS.journalFallback.length]}
                        alt={entry.title}
                      />
                    </div>
                    <div className="journal-card__body">
                      <span className="journal-card__date">
                        {formatDate(entry.publishedAt) ?? 'Recently published'}
                      </span>
                      <h3>{entry.title}</h3>
                      <span className="link-arrow">
                        Read the story
                        <ArrowRight width={15} height={15} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  )
}
