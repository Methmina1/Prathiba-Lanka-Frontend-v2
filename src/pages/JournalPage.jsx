import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { fallbackJournal } from '../data/fallback'
import { useApi } from '../hooks/useApi'
import { PROVINCES } from '../data/provinces'
import { PROVINCE_COPY } from '../data/provinceCopy'
import { journalsInProvince } from '../data/provincePlaces'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import CoverImage from '../components/ui/CoverImage'
import ProvinceMap from '../components/sections/ProvinceMap'
import PHOTOS from '../data/photos'
import { ArrowRight } from '../components/ui/Icons'
import { formatDate } from '../utils/format'

/**
 * The journal.
 *
 * The page opens on the map and nothing else: the island is the index, and a story is reached by
 * choosing the province it is about. Until a province is picked there is no list of posts on the
 * page at all - the nine provinces are the way in, which is also the honest shape of this journal,
 * because every note in it is about somewhere.
 *
 * Picking a province (clicking it on the map, or one of the buttons under it) brings up that
 * province's notes as cards, with what the province is like above them and its journeys listed in the
 * map's own panel. Releasing it - clicking the same province again - puts the page back to the map
 * alone.
 *
 * "Every story" is still below, behind a button: the full journal has to stay reachable without
 * knowing which province to look in (and a post that names no place at all would otherwise be
 * unreachable). It is collapsed rather than removed so the page still opens on the map.
 */
export default function JournalPage() {
  const { data: posts, status } = useApi(() => api.getPublishedJournal(), fallbackJournal)

  const [provinceId, setProvinceId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const province = PROVINCES.find((entry) => entry.id === provinceId) ?? null
  const notes = province ? journalsInProvince(posts, province.id).map((found) => found.post) : []

  const [featured, ...rest] = posts

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="The journal"
        title="Stories from the island"
        lede="Seasonal advice, small histories and the sort of detail that only helps once you are here. Pick a province to read what has been written about it."
        crumbs={[{ label: 'Journal' }]}
        image={PHOTOS.pageHero.journal}
        scenery="hills"
      />

      {status === 'fallback' && (
        <div className="container">
          <p className="notice">
            Showing sample stories. Published posts load from
            <code> /api/journal/published</code>.
          </p>
        </div>
      )}

      {/* The map is the page. Picking a province is what puts stories on it. */}
      <ProvinceMap posts={posts} onProvince={setProvinceId} />

      {province && (
        <section className="section journal-province" id="province-notes">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{province.name} Province</span>
              <h2>
                {notes.length === 1 ? `A note from ${province.name}` : `Notes from ${province.name}`}
              </h2>
              <p className="lede" id="province-about">
                {PROVINCE_COPY[province.id] ?? province.blurb}
              </p>
              <p className="journal-province__facts">
                Capital {province.capital} · {province.districts.join(' · ')}
              </p>
            </Reveal>

            {notes.length > 0 ? (
              <div className="grid grid--3 journal-grid">
                {notes.map((post, index) => (
                  <Reveal key={post.journalId} delay={index * 80}>
                    <Link className="card journal-card" to={`/journal/${post.journalId}`}>
                      <div className="journal-card__media">
                        <CoverImage
                          src={post.coverImageUrl}
                          fallback={PHOTOS.journalFallback[index % PHOTOS.journalFallback.length]}
                          alt={post.title}
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
            ) : (
              <div className="empty-state">
                <h3>Nothing written about {province.name} yet</h3>
                <p>
                  The journeys that go through it are listed beside the map. Try another province, or
                  read every story below.
                </p>
              </div>
            )}

            <div className="section-cta">
              <button type="button" className="link-arrow" onClick={() => setProvinceId(null)}>
                Let go of {province.name}
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="section section--muted" id="every-story">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">The journal</span>
            <h2>Every story</h2>
            <p className="lede">
              All {posts.length} of them, newest first - useful when you would rather browse than
              choose a province.
            </p>
          </div>

          {!showAll ? (
            <div className="section-cta">
              <button type="button" className="btn btn--cta btn--sweep" onClick={() => setShowAll(true)}>
                Read all {posts.length} {posts.length === 1 ? 'story' : 'stories'}
                <ArrowRight width={15} height={15} />
              </button>
            </div>
          ) : (
            <>
              {featured && (
                <Reveal>
                  <Link className="feature-post" to={`/journal/${featured.journalId}`}>
                    <div className="feature-post__media">
                      <CoverImage
                        src={featured.coverImageUrl}
                        fallback={PHOTOS.journalFallback[0]}
                        alt={featured.title}
                      />
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
                          <CoverImage
                            src={post.coverImageUrl}
                            fallback={PHOTOS.journalFallback[(index + 1) % PHOTOS.journalFallback.length]}
                            alt={post.title}
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

              <div className="section-cta">
                <button type="button" className="link-arrow" onClick={() => setShowAll(false)}>
                  Hide the list and go back to the map
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
